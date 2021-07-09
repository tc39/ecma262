#!/bin/bash

set -euxo pipefail


declare -r GH_USER_EMAIL="bot@tc39"
declare -r GH_USER_NAME="Bot"
declare -r COMMIT_MESSAGE="Update gh-pages"


cd "$(dirname "$BASH_SOURCE")"/../out

git config --global user.email "${GH_USER_EMAIL}"
git config --global user.name "${GH_USER_NAME}"
git config --global init.defaultBranch gh-pages
git init
git add -A
git commit --message "${COMMIT_MESSAGE}"
git push --force "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" gh-pages
