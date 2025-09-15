#!/bin/bash

set -euxo pipefail

DEST_DIR="gh-pages"
COMMIT_MESSAGE="Update gh-pages"
if [[ "${1:-}" == "--pr" && -n "${2:-}" ]]; then
  DEST_DIR="gh-pages/pr/$2"
  COMMIT_MESSAGE="Update gh-pages for PR $2"
fi

declare -r GH_USER_EMAIL="bot@tc39"
declare -r GH_USER_NAME="Bot"
declare -r COMMIT_MESSAGE


cd "$(dirname "$BASH_SOURCE")"/..
git clone --depth 1 --branch gh-pages "https://${GITHUB_ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" gh-pages
if [[ "${1:-}" == "--pr" ]]; then
  rm -rf "$DEST_DIR"
else
  find gh-pages \( -path 'gh-pages/.git' -o -path 'gh-pages/pr' -o -path 'gh-pages/2*' \) -prune -o -type f -exec rm -f {} +
fi
mkdir -p "$DEST_DIR"
cp -r out/* "$DEST_DIR"

cd gh-pages
git config user.email "${GH_USER_EMAIL}"
git config user.name "${GH_USER_NAME}"
git add -A
git commit --allow-empty --message "${COMMIT_MESSAGE}"
git push origin gh-pages
