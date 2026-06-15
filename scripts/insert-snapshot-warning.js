'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const { JSDOM, VirtualConsole } = require('jsdom');
const { execSync } = require('child_process');

const makeHref = (parentHref, path) =>
  new URL(path, parentHref.replace(/\/?$/, '/')).href;

// https://docs.github.com/en/actions/reference/workflows-and-actions/variables
const {
  GITHUB_EVENT_PATH,
  GITHUB_SERVER_URL = 'https://github.com',
  GITHUB_REPOSITORY = 'tc39/ecma262',
} = process.env;
const REPO_URL = makeHref(GITHUB_SERVER_URL, GITHUB_REPOSITORY);

const COMMIT = String(execSync('git rev-parse --verify HEAD')).trim();
const PR = (() => {
  const cliOptions = {
    pr: { type: 'string' },
  };
  const args = util.parseArgs({ options: cliOptions }).values;
  if (args.pr) return args.pr;

  try {
    const ghEventJson = fs.readFileSync(GITHUB_EVENT_PATH, 'utf8');
    const ghEvent = JSON.parse(ghEventJson);
    // https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request_target
    // https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads#pull_request
    return ghEvent.number;
  } catch (_err) {}
})();
const SUMMARY = PR ? `PR #${PR}` : `commit ${COMMIT.slice(0, 8)}`;

const WARNING_HTML = `
<details class="annoying-warning" open="">
  <summary>${SUMMARY}</summary>
  <p>
    This document is a preview of the specification for
    ${PR ? `<a href="${encodeURI(makeHref(REPO_URL, `pull/${PR}`))}">PR #${PR}</a>` : ''}
    commit <a href="${encodeURI(makeHref(REPO_URL, `commit/${COMMIT}`))}">${COMMIT}</a>,
    and should only be used as a historical reference. This commit may not
    have even been merged into the specification.
  </p>
  <p>
    Do not attempt to implement this version of the specification. Do not
    reference this version as authoritative in any way. Instead, see
    <a href="${encodeURI(REPO_URL)}">${REPO_URL.replaceAll('<', '&lt;')}</a> for the
    living specification.
  </p>
</details>
<script>
// make the warning keyboard-dismissable
document.addEventListener('keydown', e => {
  if (e.code === 'Escape') {
    let warning = document.querySelector(".annoying-warning");
    if (warning.open) {
      warning.open = false;
      e.stopImmediatePropagation();
    }
  }
});

// automatically collapse the warning when navigating within the same snapshot
(() => {
  let referrer;
  try {
    referrer = new URL(document.referrer);
  } catch (_err) {
    // ignore
  }
  if (!referrer || referrer.host !== location.host) return;

  let getSpecPath = url => {
    let pathParts = url.pathname.split('/');
    let isMultipage = pathParts[pathParts.length - 2] === 'multipage';
    let pathPrefixEnd = isMultipage
      ? -2
      : pathParts.findLastIndex(part => part !== '') + 1;
    let pathPrefix = pathParts.slice(0, pathPrefixEnd).join('/');
    return pathPrefix;
  };

  let referrerPathPrefix = getSpecPath(referrer);
  let pathPrefix = getSpecPath(location);
  if (referrerPathPrefix === pathPrefix) {
    document.querySelector(".annoying-warning").open = false;
  }
})();
</script>
`;

const WARNING_CSS = `
details.annoying-warning {
  background-color: #920800;
  background-image: linear-gradient(transparent 40%, rgba(255, 255, 255, 0.2));
  border: 2px solid white;
  color: rgba(255, 255, 255, 0.95);
  opacity: .95;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10;
}

details.annoying-warning[open] {
  top: 10%;
  top: calc(5vw + 5vh);
  left: 5%;
  right: 5%;
  margin: 0 auto;
  max-width: 800px;
  outline: solid 10000px rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 3px;
  box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
}

details.annoying-warning > summary {
  display: list-item; /* polyfill */
  font-size: 0.875em;
  font-weight: bold;
  letter-spacing: 0.02em;
  padding: 0.5ex 1ex;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.85);
  cursor: default;
}

details.annoying-warning[open] > summary::after {
  content: " Collapse";
  position: absolute;
  top: 0;
  right: 5px;
  font-size: smaller;
  font-weight: bold;
}

details.annoying-warning p {
  line-height: 1.4;
  margin: 1em;
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
