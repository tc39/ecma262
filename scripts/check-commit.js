#!/usr/bin/env node

'use strict';

const exec = require('child_process').execSync;

const oldestAncestor = String(exec(`bash -c 'diff -u <(git rev-list --first-parent "\${1:-origin/master}") <(git rev-list --first-parent "\${2:-HEAD}") | sed -ne "s/^ //p" | head -1' -`)).trim();

console.log(`Oldest ancestor SHA: ${oldestAncestor}`);

const messages = String(exec(`git log --format=%s ${oldestAncestor}..HEAD | sed '/^[[:space:]]*\$/d'`)).trim().split('\n').reverse();

const [first, ...rest] = messages;

const prefixes = ['Normative', 'Editorial', 'Meta', 'Layering'];
const firstPrefixRE = new RegExp(`^(?:${prefixes.join('|')}): `);
const prefixRE = new RegExp(`^(?:${prefixes.concat('fixup', 'squash').join('|')}): `);

const errors = [];
if (!firstPrefixRE.test(first)) {
	errors.push(`First commit must start with a valid prefix (${prefixes.join(', ')}), followed by “: ”`);
}

rest.forEach((msg) => {
	if (!prefixRE.test(msg)) {
		errors.push(`Commit “${msg}” must start with a valid prefix (${prefixes.join(', ')}) or “fixup” or “squash”, followed by “: ”`);
	}
});

const suffixRE = / \(#[1-9][0-9]+\)$/

messages.forEach((msg) => {
	if (!suffixRE.test(msg)) {
		errors.push(`Commit “${msg}” must end with “ (#123)”, where 123 is the PR number`);
	}
});

if (errors.length === 0) {
	console.log('Commit messages are valid!');
} else {
	console.error(`Errors:
${errors.map(x => ` - ${x}`).join('\n')}
`);
	process.exitCode = errors.length;
}
