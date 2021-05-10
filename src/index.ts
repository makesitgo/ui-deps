#!/usr/bin/env node

import { execSync } from 'child_process';
import { SemVer } from 'semver';

import runner from './runner';
import * as u from './utils';

runner(() => print(parse(getOutdatedDeps())));

interface DependencyInfo {
  name: string;
  current: SemVer;
  wanted: SemVer;
  latest: SemVer;
  packageType: string;
  url: string;
}

function getOutdatedDeps() {
  const rawOutput = getYarnOutdated();

  const outdatedDeps: DependencyInfo[] = [];

  for (const line of rawOutput) {
    if (!line) {
      continue;
    }

    for (const payload of line.split('\n')) {
      if (!payload) {
        continue;
      }

      const o = JSON.parse(payload);
      if (o.type !== 'table') {
        continue;
      }

      for (const dep of o.data.body) {
        outdatedDeps.push({
          name: dep[0],
          current: new SemVer(dep[1]),
          wanted: new SemVer(dep[2]),
          latest: new SemVer(dep[3]),
          packageType: dep[4],
          url: dep[5],
        });
      }
    }
  }

  return outdatedDeps;
}

function getYarnOutdated() {
  try {
    execSync('yarn outdated --json', { encoding: 'utf8' }).toString();

    console.log('no outdated dependencies found.');
    return [];
  } catch (e) {
    if (u.isSpawnErr(e)) {
      if (e.status === 1 && !e.error) {
        // yarn outdated returns a non-zero exit code if/when dependencies are found outdated
        return e.output;
      }
      throw e.error;
    }
    throw e;
  }
}

interface Analysis {
  patchDeps: DependencyInfo[];
  patchMeta: PatchMeta;
  majorDeps: DependencyInfo[];
  minorDeps: DependencyInfo[];
}

interface PatchMeta {
  nameMaxLength: number;
  versionMaxLength: number;
}

function parse(outdatedDeps: DependencyInfo[]) {
  const a: Analysis = {
    patchDeps: [],
    patchMeta: { nameMaxLength: 0, versionMaxLength: 0 },
    majorDeps: [],
    minorDeps: [],
  };

  for (const dep of outdatedDeps) {
    const { current, latest } = dep;
    if (current.major !== latest.major) {
      a.majorDeps.push(dep);
    } else if (current.minor !== latest.minor) {
      a.minorDeps.push(dep);
    } else {
      a.patchDeps.push(dep);
      if (dep.name.length > a.patchMeta.nameMaxLength) {
        a.patchMeta.nameMaxLength = dep.name.length;
      }
      if (dep.current.raw.length > a.patchMeta.versionMaxLength) {
        a.patchMeta.versionMaxLength = dep.current.raw.length;
      }
    }
  }

  return a;
}

function print({ patchDeps, patchMeta, majorDeps, minorDeps }: Analysis) {
  console.log(`---
${yarnUpgradePatch(patchDeps, patchMeta)}
${majorDeps.map(yarnUpgradeMinorOrMajor).join('\n')}
${minorDeps.map(yarnUpgradeMinorOrMajor).join('\n')}`);
}

function yarnUpgradePatch(patchDeps: DependencyInfo[], { nameMaxLength, versionMaxLength }: PatchMeta) {
  return `yarn upgrade --latest \\
  ${patchDeps.map((d) => d.name).join(' ')} && \\
  yarn lint && yarn test && \\
  git add . && git commit -n -m 'update patch dependencies

${patchDeps
  .map(
    ({ name, current, latest }) =>
      `${name.padEnd(nameMaxLength)} ${current.raw.padEnd(versionMaxLength)} -> ${latest.raw}`
  )
  .join('\n')}
'
`;
}

function yarnUpgradeMinorOrMajor({ name, current, latest }: DependencyInfo) {
  return `yarn upgrade --latest ${name} && \\
  yarn lint && yarn test && \\
  git add . && git commit -n -m "update ${name} from v${current.raw} to v${latest.raw}"
`;
}
