import { promisify } from 'node:util';
import { exec } from 'node:child_process';
const execP = promisify(exec);
import { writeFile } from 'node:fs/promises';

const MIN_WORD_SIZE = 3;

const BASE_REF = process.argv[2];
const ASPELL_OPTS = [
  '--add-html-check=alt,title,caption,variants',
  '--ignore-case',
  '--master=en_GB-ize',
  '--mode=html',
  '--run-together',
  '--run-together-limit=99',
  '--run-together-min=2',
  'list',
].join(' ');

function makeDict(words) {
  return `personal_ws-1.1 en ${words.length}\n${words.join('\n')}`;
}

function lines(text) {
  if (text.length === 0) return [];
  return text.split('\n');
}

console.log(`base ref: ${BASE_REF}`);

let { stdout } = await execP(`git show "${BASE_REF}":spec.html | aspell ${ASPELL_OPTS} | sort -fu`);

let existingWords = lines(stdout.trim());

let existingComponents = Array.from(new Set(
  existingWords
    .flatMap(word => [...word.matchAll(/(?:^[a-z]|[A-Z])[a-z]{2,}/g)])
    .map(([w]) => w.toLowerCase())
));

({ stdout } = await execP(`echo ${existingComponents.map(w => JSON.stringify(w)).join(' ')} | aspell ${ASPELL_OPTS} | sort -fu`));

let existingComponentsReduced = lines(stdout.trim());

await writeFile('aspell.txt', makeDict(existingComponentsReduced));

({ stdout } = await execP(`echo ${existingWords.map(w => JSON.stringify(w)).join(' ')} | aspell --personal=./aspell.txt ${ASPELL_OPTS}`));

let novel = [...existingComponentsReduced, ...lines(stdout.trim())].filter(w => w.length >= MIN_WORD_SIZE);
novel.sort();
console.log(`\npreviously used novel words: ${novel.join(', ')}`);
await writeFile('aspell.txt', makeDict(novel));

({ stdout } = await execP(`aspell --personal=./aspell.txt ${ASPELL_OPTS} list <spec.html | sort -u`));
let misspellings = lines(stdout.trim()).filter(w => w.length >= MIN_WORD_SIZE);

if (misspellings.length > 0) {
  console.log(`\nmisspellings: ${misspellings.join(', ')}`);
  let pattern = misspellings.map(w => `-e ${JSON.stringify(w)}`).join(' --or ');
  ({ stdout } = await execP(`git grep --line-number --column --fixed-strings --only-matching ${pattern} -- spec.html`));

  console.log('');

  let info = lines(stdout.trim());
  for (let warning of info) {
    let [match, file, line, col, typo] = warning.match(/^([^:]+):(\d+):(\d+):(.*)$/);
    let title = 'Potential Typo';
    let message = `${JSON.stringify(typo)} is not a previously used word or composed of previously used words. Perhaps it is a typo?`;
    // https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-a-warning-message
    console.log(`::warning file=${file},line=${line},endLine=${line},col=${col},endColumn=${col + typo.length},title=${title}::${message}`);
  }
}
