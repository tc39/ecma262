#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const DEFAULT_SPEC_PATH = fileURLToPath(new URL('../spec.html', import.meta.url));
const ROOT_WORD_REPLACEMENTS_PATH = new URL('./check-alias-abbreviations.csv', import.meta.url);

const aliasPattern = /\b_([A-Za-z][A-Za-z0-9]*)_\b/g;

const allowedAliases = new Set([
  'TypedArray',
  'argumentListNode',
  'argumentsNode',
  'argumentsObj',
  'argumentsObjNeeded',
  'isTypedArray',
]);

const rootWordReplacements = readRootWordReplacements(ROOT_WORD_REPLACEMENTS_PATH);

const args = parseArgs(process.argv.slice(2));
const source = fs.readFileSync(args.specPath, 'utf8');
const relativeSpecPath = path.relative(process.cwd(), args.specPath) || path.basename(args.specPath);
const warnings = [];

for (const [lineIndex, line] of source.split(/\r?\n/).entries()) {
  for (const match of line.matchAll(aliasPattern)) {
    const alias = match[1];
    if (allowedAliases.has(alias)) {
      continue;
    }

    const underscoreOffset = match.index;
    const hits = findDisallowedRootWords(alias);
    if (hits.length === 0) {
      continue;
    }

    const suggestedAlias = suggestAlias(alias, hits);
    for (const hit of hits) {
      const column = underscoreOffset + hit.start + 2;
      warnings.push({
        alias,
        column,
        endColumn: column + hit.matchedText.length,
        hit,
        lineNumber: lineIndex + 1,
        suggestedAlias,
      });
    }
  }
}

for (const warning of warnings) {
  const {alias, column, endColumn, hit, lineNumber, suggestedAlias} = warning;
  const title = 'Disallowed Alias Root Word';
  const message =
    `Alias _${alias}_ contains disallowed component ${JSON.stringify(hit.matchedText)}; ` +
    `use ${JSON.stringify(hit.abbreviation)} instead (suggested alias: _${suggestedAlias}_).`;
  console.log(
    `::warning file=${escapeProperty(relativeSpecPath)},line=${lineNumber},endLine=${lineNumber},` +
    `col=${column},endColumn=${endColumn},title=${escapeProperty(title)}::${escapeData(message)}`,
  );
}

if (warnings.length === 0) {
  console.log(`No disallowed alias root words found in ${relativeSpecPath}.`);
}

function parseArgs(argv) {
  let specPath = undefined;

  for (const arg of argv) {
    if (arg === '--help') {
      console.log('Usage: node scripts/check-alias-abbreviations.mjs [path/to/spec.html]');
      process.exit(1);
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (specPath !== undefined) {
      throw new Error(`Unexpected argument: ${arg}`);
    }
    specPath = path.resolve(arg);
  }

  specPath ||= DEFAULT_SPEC_PATH;
  return {specPath};
}

function readRootWordReplacements(csvPath) {
  const lines = fs.readFileSync(csvPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  const [header, ...rows] = lines;
  if (header !== 'root word,chosen abbreviation') {
    throw new Error('Expected check-alias-abbreviations.csv to start with "root word,chosen abbreviation".');
  }

  return rows.map((line, index) => {
    const rowNumber = index + 2;
    const [rootWord, abbreviation, ...extraColumns] = parseCsvRow(line);
    if (!rootWord || !abbreviation || extraColumns.length > 0) {
      throw new Error(`Invalid check-alias-abbreviations.csv row ${rowNumber}: expected two columns.`);
    }

    return {
      abbreviation,
      parts: splitName(rootWord).map((part) => part.text.toLowerCase()),
      rootWord,
    };
  });
}

function parseCsvRow(row) {
  const cells = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];

    if (inQuotes) {
      if (character === '"' && row[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === ',') {
      cells.push(cell);
      cell = '';
    } else if (character === '"' && cell === '') {
      inQuotes = true;
    } else {
      cell += character;
    }
  }

  if (inQuotes) {
    throw new Error(`Invalid CSV row with unterminated quoted field: ${row}`);
  }

  cells.push(cell);
  return cells;
}

function splitName(name) {
  const parts = [];
  const partPattern = /[A-Z]+(?=[A-Z][a-z]|[0-9]|$)|[A-Z]?[a-z]+|[0-9]+/g;

  for (const match of name.matchAll(partPattern)) {
    parts.push({
      end: match.index + match[0].length,
      start: match.index,
      text: match[0],
    });
  }

  return parts;
}

function findDisallowedRootWords(alias) {
  const parts = splitName(alias);
  const candidates = [];

  for (const root of rootWordReplacements) {
    for (let index = 0; index <= parts.length - root.parts.length; index += 1) {
      const candidate = matchRootAtPart(alias, parts, root, index);
      if (candidate) {
        candidates.push(candidate);
      }
    }
  }

  candidates.sort((a, b) =>
    a.start - b.start ||
    (b.end - b.start) - (a.end - a.start) ||
    a.rootWord.localeCompare(b.rootWord),
  );

  const hits = [];
  for (const candidate of candidates) {
    if (hits.some((hit) => rangesOverlap(hit, candidate))) {
      continue;
    }
    hits.push(candidate);
  }

  return hits;
}

function matchRootAtPart(alias, parts, root, startPartIndex) {
  let end = null;

  for (let offset = 0; offset < root.parts.length; offset += 1) {
    const part = parts[startPartIndex + offset];
    const partText = part.text.toLowerCase();
    const rootPart = root.parts[offset];
    const isLastPart = offset === root.parts.length - 1;

    if (partText === rootPart) {
      if (isLastPart) {
        end = part.end;
      }
      continue;
    }

    if (isLastPart && partText === `${rootPart}s`) {
      end = part.end - 1;
      continue;
    }

    return null;
  }

  const start = parts[startPartIndex].start;
  const matchedText = alias.slice(start, end);
  const replacement = formatReplacement(alias, start, matchedText, root.abbreviation);
  return {
    abbreviation: root.abbreviation,
    end,
    matchedText,
    replacement,
    rootWord: root.rootWord,
    start,
  };
}

function formatReplacement(alias, start, matchedText, abbreviation) {
  if (start > 0 && /^[A-Z]/.test(matchedText)) {
    return abbreviation[0].toUpperCase() + abbreviation.slice(1);
  }
  return abbreviation;
}

function rangesOverlap(a, b) {
  return a.start < b.end && b.start < a.end;
}

function suggestAlias(alias, hits) {
  let suggested = alias;
  for (const hit of [...hits].sort((a, b) => b.start - a.start)) {
    suggested = `${suggested.slice(0, hit.start)}${hit.replacement}${suggested.slice(hit.end)}`;
  }
  return suggested;
}

function escapeData(value) {
  return value
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A');
}

function escapeProperty(value) {
  return escapeData(value)
    .replace(/:/g, '%3A')
    .replace(/,/g, '%2C');
}
