#!/usr/bin/env node

// web URL: `https://docs.google.com/spreadsheets/d/${sheetID}/edit`
const sheetID = '1if5bU0aV5MJ27GGKnRzyAozeKP-ILXYl5r3dzvkGFmg';

// TC39 API key for google sheets
const key = process.env.GOOGLE_API_KEY;

const sheetData = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/Sheet1!A2:A?key=${key}`;

const [,, slug, branch] = process.argv;

if (!slug || !branch) {
	throw 'args required: slug, branch';
}
if (!process.env.GH_TOKEN) {
	throw 'GH_TOKEN env var required';
}
if (!key) {
	throw 'GOOGLE_API_KEY env var required';
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
			Authorization: `token ${process.env.GH_TOKEN}`,
			'User-Agent': 'curl/7.54.0'
		}
	};

	return new Promise((resolve, reject) => {
		const req = lib.request(url, params, res => {
			if (res.statusCode < 200 || res.statusCode >= 300) {
				return reject(new Error(`Status Code: ${res.statusCode}`));
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

const branchURL = `https://api.github.com/repos/${slug}/compare/master...${branch}?anon=1`;

const authors = request(branchURL).then((json) => JSON.parse(json)).then(data => {
	return [...new Set(data.commits.map(x => x.author.login))];
}).then((authors) => {
	console.log(`Found authors: ${authors.join(',')}\n`);
	return authors;
});

const teamURL = 'https://api.github.com/orgs/tc39/teams/delegates';

function getMembers(teamID, page = 1) {
	const memberURL = `https://api.github.com/teams/${teamID}/members?per_page=100&page=${page}`;
	const data = request(memberURL).then((json) => JSON.parse(json));
	return data.then((data) => {
		if (data.length > 0) {
			return data;
		}
		return getMembers(teamID, page + 1).then(nextPage => data.concat(nextPage));
	});
}

const delegates = request(teamURL).then((json) => JSON.parse(json)).then(data => {
	return getMembers(data.id);
}).then((data) => {
	const delegateNames = new Set(data.map(x => x.login));
	console.log(`Found delegates: ${[...delegateNames].join(',')}\n`);
	return delegateNames;
});

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
	console.log('Found usernames: ' + [...usernames].join(',') + '\n');
	return usernames;
});

Promise.all([usernames, authors, delegates]).then(([usernames, authors, delegates]) => {
	const missing = authors.filter(a => !usernames.has(a) && !delegates.has(a));
	if (missing.length > 0) {
		throw `Missing authors: ${missing}`;
	} else {
		console.log('All authors have signed the form, or are delegates!');
	}
}).catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
