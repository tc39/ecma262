#!/bin/bash

set -euxo pipefail


$(npm bin)/ecmarkup --verbose spec.html --write-biblio biblio/biblio.json /dev/null

cp LICENSE.md biblio/

cd biblio

COMMIT_COUNT=$(git rev-list --count HEAD)
npm version --no-git-tag-version "2.0.${COMMIT_COUNT}"

SHORT_COMMIT=$(git rev-parse --short HEAD)
LONG_COMMIT=$(git rev-parse --verify HEAD)
echo "
This version was built from commit [${SHORT_COMMIT}](https://github.com/tc39/ecma262/tree/${LONG_COMMIT})." >> README.md

npm pkg set commit="${LONG_COMMIT}"

npm publish --access public
