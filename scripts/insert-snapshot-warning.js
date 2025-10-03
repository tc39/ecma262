'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { execSync } = require('child_process');

const COMMIT = String(execSync('git rev-parse --verify HEAD')).trim();

const WARNING_HTML = `
<details class="annoying-warning" open="">
  <summary>This is a commit snapshot of the specification</summary>
  <p>
    This document contains the contents of the specification as of
    <a href="https://github.com/tc39/ecma262/commit/${COMMIT}">commit ${COMMIT}</a>,
    and should only be used as a historical reference. This commit may not
    have even been merged into the specification.
  </p>
  <p>
    Do not attempt to implement this version of the specification. Do not
    reference this version as authoritative in any way. Instead, see
    <a href="https://tc39.es/ecma262">https://tc39.es/ecma262</a> for the
    living specification.
  </p>
</details>
<script>
let base = "https://ci.tc39.es/preview/tc39/ecma262/sha/";
if (
  location.href.startsWith(base) &&
  document.referrer.startsWith(base) &&
  location.href.substring(base.length, base.length + 40) === document.referrer.substring(base.length, base.length + 40)
) {
  document.querySelector(".annoying-warning").open = false;
}
</script>
`;

const WARNING_CSS = `
details.annoying-warning {
  background-color: #920800;
  background-image: linear-gradient(transparent 40%, rgba(255, 255, 255, 0.2));
  border: solid rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  border-width: 1px 1px 0 1px;
  box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.95);
  opacity: .95;
  position: fixed;
  left: 5%;
  margin: 0 auto;
  right: 5%;
  z-index: 10;
}

details.annoying-warning[open] {
  top: 10%;
  top: calc(5vw + 5vh);
  max-width: 1024px;
  outline: solid 10000px rgba(255, 255, 255, 0.6);
}

details.annoying-warning:not([open]) {
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 0;
}

details.annoying-warning > summary {
  display: list-item; /* polyfill */
  font-size: 0.875em;
  font-weight: bold;
  letter-spacing: 0.02em;
  padding: 10px 5px;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.85);
  cursor: default;
}

details.annoying-warning > summary::after {
  content: " Expand";
  position: absolute;
  top: 0;
  right: 5px;
  font-size: smaller;
  font-weight: bold;
}

details.annoying-warning[open] > summary::after {
  content: " Collapse";
}

details.annoying-warning p {
  padding: 0 7.5% 1em;
  line-height: 1.4;
  margin: 0;
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.85);
}

details.annoying-warning a {
  color: white;
  text-decoration: underline;
}
`;

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
