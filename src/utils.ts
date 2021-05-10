import { SpawnSyncReturns } from 'child_process';

export function hasOwnProperty<T extends {}, K extends PropertyKey>(o: T, k: K): o is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(o, k);
}

export function isObject(o?: unknown): o is object {
  return typeof o === 'object' && !!o;
}

export const dependencyGroups = {
  babel: {},
};

type SpawnErr = Pick<SpawnSyncReturns<string>, 'error' | 'output' | 'signal' | 'status'>;

export function isSpawnErr(err: unknown): err is SpawnErr {
  if (!isObject(err)) {
    return false;
  }
  return hasOwnProperty(err, 'signal') && hasOwnProperty(err, 'status');
}
