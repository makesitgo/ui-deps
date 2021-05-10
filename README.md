# ui-deps

## usage

pull down the repo

```cmd
$ git clone git@github.com:makesitgo/ui-deps.git
```

build and link the cli

```cmd
$ yarn build && yarn link
```

cd to the repo you want to update dependencies for and link the built cli

```cmd
$ yarn link ui-deps
```

then run

```cmd
$ ui-deps
```

if you link `ui-deps` this way, you can then modify its behavior however you see fit and run `yarn build` to update it in the repo where you have run `yarn link ui-deps` in.

## output

the output is meant to just be raw text that aids you in updating dependencies for any of our ui repos.  it is a set of terminal commands in an opinionated format that can update the repo's outdated dependencies according to our team's workflow.

this is not meant to automate the process, simply reduce human error.

### patch updates

the first part of the output will use `yarn upgrade` to update the repo's dependencies which require patch version updates, all in one commit.

**example**:

```cmd
yarn upgrade --latest \
  @babel/register @leafygreen-ui/badge @leafygreen-ui/card @leafygreen-ui/checkbox @leafygreen-ui/toggle @types/jest ts-jest typescript && \
  yarn lint && yarn test && \
  git add . && git commit -n -m 'update patch dependencies

@babel/register         7.13.8  -> 7.13.16
@leafygreen-ui/badge    4.0.2   -> 4.0.3
@leafygreen-ui/card     5.1.0   -> 5.1.1
@leafygreen-ui/checkbox 6.0.2   -> 6.0.3
@leafygreen-ui/palette  3.2.0   -> 3.2.1
@types/jest             26.0.21 -> 26.0.23
ts-jest                 26.5.4  -> 26.5.6
typescript              4.2.3   -> 4.2.4
'
```

### major and minor updates

the repo's dependnecies which require either minor or major version updates should be upgraded in separate commits.  the rest of the output (past the patch updates) is the list of `yarn upgrade` commands for each of these updates.

**example:**

```cmd
yarn upgrade --latest @leafygreen-ui/button && \
  yarn lint && yarn test && \
  git add . && git commit -n -m "update @leafygreen-ui/button from v10.0.2 to v12.0.1"
```

you may find updating groups of related dependences helpful. in case one upgrade ends up not working out, it will be easier to revert any related upgrades as well.
