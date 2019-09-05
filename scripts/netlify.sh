#!/bin/sh

set -ex

git remote add origin https://github.com/tc39/ecma262.git
git fetch --all

npm run build-master

node scripts/diff
node scripts/insert_snapshot_warning
