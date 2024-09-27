'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { execSync } = require('child_process');

const COMMIT = String(execSync('git rev-parse --verify HEAD')).trim();

const WARNING_HTML = fs.readFileSync(path.join(__dirname, 'snapshot_warning.html'), 'utf8')
  .replace(/{COMMIT}/g, COMMIT);
const WARNING_CSS = fs.readFileSync(path.join(__dirname, 'snapshot_warning.css'), 'utf8');

console.log('Inserting snapshot reference warning...');

const virtualConsole = new VirtualConsole();
virtualConsole.on('error', () => {
  // Suppress warnings from e.g. CSS features not supported by JSDOM
});

(async () => {
  let files = ['out/index.html', ...fs.readdirSync('out/multipage').filter(f => f.endsWith('.html')).map(f => 'out/multipage/' + f)];
  for (let file of files) {
    console.log(file);
    let dom = await JSDOM.fromFile(file, { contentType: 'text/html; charset=utf-8', virtualConsole });
    const { document } = dom.window;

    const style = document.createElement('style');
    style.textContent = WARNING_CSS;
    document.head.append(style);

    // insert WARNING_HTML in beginning of body so it renders
    // first even on slower devices and browsers
    document.body.insertAdjacentHTML('afterbegin', WARNING_HTML);

    fs.writeFileSync(file, dom.serialize(), 'utf8');
  }
  console.log('Done!');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
