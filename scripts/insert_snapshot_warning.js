'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { execSync } = require('child_process');

const COMMIT = String(execSync('git rev-parse --verify HEAD'));

const WARNING_HTML = fs.readFileSync(path.join(__dirname, 'snapshot_warning.html'), 'utf8')
  .replace(/{COMMIT}/g, COMMIT);
const WARNING_CSS = fs.readFileSync(path.join(__dirname, 'snapshot_warning.css'), 'utf8');

console.log('Inserting snapshot reference warning...');

JSDOM.fromFile('./out/index.html', { contentType: 'text/html; charset=utf-8' }).then((dom) => {
  const { document } = dom.window;

  const style = document.createElement('style');
  style.textContent = WARNING_CSS;
  document.head.append(style);

  // insert WARNING_HTML in beginning of body so it renders
  // first even on slower devices and browsers
  document.body.insertAdjacentHTML('afterbegin', WARNING_HTML);

  fs.writeFileSync('./out/index.html', dom.serialize(), 'utf8');

  console.log('Done!');
}).catch((reason) => {
  console.error(reason);
  process.exitCode = 1;
});
