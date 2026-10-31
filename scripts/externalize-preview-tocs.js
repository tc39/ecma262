'use strict';

// GitHub Pages rejects sites over 10 GB, and most of the size of a PR preview is
// the table of contents that's inlined, identically, in each of its pages. This
// moves it to a script in the preview's assets, which ecmarkup.js runs after.
//
// Already-processed pages have an empty table of contents and are left as is, so
// this is safe to run repeatedly. Pages it can't process still work, so they're
// reported and skipped: one bad preview must not fail the deploy of main.
//
// Usage: node scripts/externalize-preview-tocs.js <preview dir>...

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const TOC_START = '<div id="menu-toc">';
const ECMARKUP_SCRIPT = /<script\b[^>]*\bsrc="((?:\.\.\/)?)assets\/js\/ecmarkup\.js[^>]*>/;

function externalizeToc(previewDir, file) {
  const html = fs.readFileSync(file, 'utf8');
  const tocStart = html.indexOf(TOC_START) + TOC_START.length;
  const tocEnd = html.indexOf('</div>', tocStart);
  const script = html.match(ECMARKUP_SCRIPT);
  if (tocStart < TOC_START.length || tocEnd < 0 || !script) {
    return 'skipped';
  }

  const toc = html.slice(tocStart, tocEnd);
  if (toc === '') {
    return 'unchanged';
  }
  if (!toc.startsWith('<ol') || !toc.endsWith('</ol>')) {
    return 'skipped';
  }

  const js = `document.getElementById('menu-toc').innerHTML = ${JSON.stringify(toc)};\n`;
  const hash = crypto.createHash('sha256').update(js).digest('hex').slice(0, 16);
  const assetPath = `assets/js/toc-${hash}.js`;
  fs.writeFileSync(path.join(previewDir, assetPath), js, 'utf8');

  // must run before the DOMContentLoaded listeners of the deferred ecmarkup.js
  const tocScript = `<script defer="" src="${script[1]}${assetPath}"></script>`;
  fs.writeFileSync(
    file,
    html.slice(0, script.index) + tocScript + html.slice(script.index, tocStart) + html.slice(tocEnd),
    'utf8',
  );
  return 'externalized';
}

function listPages(previewDir) {
  const multipageDir = path.join(previewDir, 'multipage');
  const multipage = fs.existsSync(multipageDir) ? fs.readdirSync(multipageDir) : [];
  return [].concat(
    path.join(previewDir, 'index.html'),
    multipage
      .filter((f) => f.endsWith('.html'))
      .map((f) => path.join(multipageDir, f)),
  );
}

function tryExternalizeToc(previewDir, file) {
  try {
    const result = externalizeToc(previewDir, file);
    if (result === 'skipped') {
      console.warn(`Could not externalize the table of contents in ${file}`);
    }
    return result;
  } catch (e) {
    console.warn(`Could not externalize the table of contents in ${file}: ${e.message}`);
    return 'skipped';
  }
}

const results = process.argv.slice(2)
  .flatMap((previewDir) => {
    return listPages(previewDir).map((file) => tryExternalizeToc(previewDir, file));
  });

function count(expected) {
  return results.filter((result) => result === expected).length;
}

console.log({ externalized: count('externalized'), unchanged: count('unchanged'), skipped: count('skipped') });
