#!/bin/bash

set -euxo pipefail


declare -r GH_USER_EMAIL="bot@tc39"
declare -r GH_USER_NAME="Bot"
declare -r COMMIT_MESSAGE="Update gh-pages"


cd "$(dirname "$BASH_SOURCE")"/..
git clone --depth 1 --branch gh-pages "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" gh-pages
find gh-pages -type f \! \( -path 'gh-pages/2*' -o -path 'gh-pages/.git*' \) -exec rm -rf {} \;
cp -r out/* gh-pages

cd gh-pages
git config user.email "${GH_USER_EMAIL}"
git config user.name "${GH_USER_NAME}"
git add -A
git commit --allow-empty --message "${COMMIT_MESSAGE}"
git push origin gh-pages
