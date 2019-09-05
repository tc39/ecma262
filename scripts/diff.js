'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const os = require('os');
const { JSDOM } = require('jsdom');

const BUILD_PATH = path.resolve(__dirname, '../out/index.html');
const DIFF_PATH = path.resolve(__dirname, './htmldiff.pl');
const OLD_PATH = path.resolve(os.tmpdir(), './old.html');
const NEW_PATH = path.resolve(os.tmpdir(), './new.html');

const ghPagesRev = cp.execSync('git branch --list --remote | grep "gh-pages"').toString().trim();
const last = cp.execSync(`git show ${ghPagesRev}:index.html`, {
  maxBuffer: 10 * 1024 * 1024, // 10M
});
fs.writeFileSync(OLD_PATH, last);
fs.copyFileSync(BUILD_PATH, NEW_PATH);

cp.execSync(`perl ${DIFF_PATH} ${OLD_PATH} ${NEW_PATH} > ${BUILD_PATH}`);
