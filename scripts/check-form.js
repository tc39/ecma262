#!/usr/bin/env node

// web URL: `https://docs.google.com/spreadsheets/d/${sheetID}/edit`
const sheetID = '1if5bU0aV5MJ27GGKnRzyAozeKP-ILXYl5r3dzvkGFmg';

const {
	GOOGLE_API_KEY: key, // TC39 API key for google sheets
	GH_TOKEN
} = process.env;

if (!GH_TOKEN) {
	throw 'GH_TOKEN env var required';
}
if (!key) {
	throw 'GOOGLE_API_KEY env var required';
}

const sheetData = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Sheet1!A2:A?key=${key}`;

const [,, slug, branch, all] = process.argv;

if (!slug || !branch) {
	throw 'args required: slug, branch';
}
if (typeof all !== 'undefined' && all !== '--all') {
	throw '`all` arg, if provided, must be `--all`'
}

const request = async (url, method = 'GET', postData) => {
	// adapted from https://medium.com/@gevorggalstyan/how-to-promisify-node-js-http-https-requests-76a5a58ed90c
	const lib = url.startsWith('https://') ? require('https') : require('http');

	const [h, path] = url.split('://')[1].split('/');
	const [host, port] = h.split(':');

	const params = {
		host,
		port: port || url.startsWith('https://') ? 443 : 80,
		method,
		headers: {
			Authorization: `token ${GH_TOKEN}`,
			'User-Agent': 'curl/7.54.0'
		}
	};

	return new Promise((resolve, reject) => {
		const req = lib.request(url, params, res => {
			if (res.statusCode < 200 || res.statusCode >= 300) {
				return reject(new Error(`Status Code: ${res.statusCode}; ${url}`));
			}

			const data = [];

			res.on('data', chunk => {
				data.push(chunk);
			});

			res.on('end', () => resolve(String(Buffer.concat(data))));
		});

		req.on('error', reject);

		if (postData) {
			req.write(postData);
		}

		req.end();
	});
};

const initial = '11db17a21add028b8d12930a8b047af1df2d3194'; // git rev-list --max-parents=0 HEAD

const branchURL = `https://api.github.com/repos/${slug}/compare/${all ? initial : 'HEAD'}...${branch}?anon=1`;

const authors = request(branchURL).then((json) => JSON.parse(json)).then(data => {
	return [...new Set(data.commits.flatMap(x => x?.author?.login || []))];
}).then((authors) => {
	console.log(`Found ${authors.length} authors: ${authors.join(',')}\n`);
	return authors;
});

const teamURL = (team) => `https://api.github.com/orgs/tc39/teams/${team}`;

function getMembers(teamID, page = 1) {
	const memberURL = `https://api.github.com/teams/${teamID}/members?per_page=100&page=${page}`;
	const data = request(memberURL).then((json) => JSON.parse(json));
	return data.then((data) => {
		if (data.length === 0) {
			return data;
		}
		return getMembers(teamID, page + 1).then(nextPage => {
			return data.concat(nextPage);
		});
	});
}

function handler(kind) {
	return (data) => {
		const names = new Set(data.map(x => x.login));
		if (names.has('bmeck')) {
			names.add('bfarias-godaddy'); // alternate github account
		}
		console.log(`Found ${names.size} ${kind}: ${[...names].join(',')}\n`);
		return names;
	}
}

const delegates = request(teamURL('delegates')).then((json) => JSON.parse(json)).then(data => {
	return getMembers(data.id);
}).then(handler('delegates'));

const emeriti = request(teamURL('emeriti')).then((json) => JSON.parse(json)).then(data => {
	return getMembers(data.id);
}).then(handler('emeriti'));

const usernames = request(sheetData).then((json) => JSON.parse(json)).then(data => {
	if (!Array.isArray(data.values)) {
		throw 'invalid data';
	}
	const usernames = new Set(
		data.values
			.flat(1)
			.map(x => x.replace(/^(https?:\/\/)?github\.com\//, '').replace(/^@/, ''))
			.filter(x => /^[a-z0-9_-]{1,39}$/gi.test(x))
			.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
	);
	console.log(`Found ${usernames.size} usernames: ` + [...usernames].join(',') + '\n');
	return usernames;
});

Promise.all([usernames, authors, delegates, emeriti]).then(([usernames, authors, delegates, emeriti]) => {
	const missing = authors.filter(a => !usernames.has(a) && !delegates.has(a) && !emeriti.has(a));
	if (missing.length > 0) {
		throw `Missing authors: ${missing}`;
	} else {
		console.log('All authors have signed the form, or are delegates or emeriti!');
	}
}).catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
