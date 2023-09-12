#!/usr/bin/env node

const { execSync } = require('child_process');

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

const sha = String(execSync(`git rev-parse --short ${branch}`)).trim();

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

const perPage = 100;

const legacyCommitsWithUnknownAuthors = new Set([
	'6e2f689b1bcecaf59f5e7c76e544443ffe4ed299',
	'a103b287cd19bdc51c7a3d8d7c1431b1506a74e2',
	'2527be4344c78e5ed56aef8e08463160f5bb2154',
	'5c9f191c9e6ccfc909817510bf74fd64ea145ac4',
	'8710d2b2a8906d0d41e90cfcb9f47573d8d573fb',
	'0b89915d3ccbf372e8114d823688d74e7778bfdb',
	'4374762005846b779d1cc4f03aeababe41af0e79',
	'676dae0955b072a31b05eafdab17dfcd8f7b4975',
	'2724be0f9aeb6265c60935334a3bdc293b2c4b4e',
	'1c6fb24ef7b29558593ce6fd4310c3bc4fe67d82',
	'dcc9584e642b55b8a99df91f2e80d065e3d2451c',
	'daef7b05b2625caf06ab546acd6eb654e9777d16',
	'eb0615ea028000d84f3d5dcd9d94a74558d3a206',
	'50ec9b4195df6caf4da2352e0edb19024b515f2d',
	'8d7995d6f7538534f2a54af4811c939ac8614676',
	'1046a423adf3ea9c5460cdbdf3a9c156f52f1632',
	'cdf5865b7da09cce276581f134349e24d2b6c199',
	'b7d01876c19751e4c75d9910ce4fb2e0d1dc45fa',
	'cc46cc38b9374d13f958cc6992daaec73d5fbecd',
	'f424bf075fe582ed8acc36e8a420ee713a21561a', // https://github.com/tc39/ecma262/pull/3142
	'bea8d0d682fcf2be2a29564bd2ae66ab9dcce21c', // https://github.com/tc39/ecma262/pull/612, user deleted their github
]);

function getAuthorFromCommit(commitObj) {
	if (!commitObj) {
		return false;
	}
	const { author } = commitObj;
	if (!author) {
		return Symbol(commitObj.sha);
	}
	return author.login;
}

async function getAllCommits(page = 1) {
	const commitsURL = `https://api.github.com/repos/${slug}/commits?anon=1&per_page=${perPage}&page=${page}&sha=${sha}`;
	const commits = await request(commitsURL).then((json) => JSON.parse(json));
	return [...new Set([].concat(
		commits.flatMap(x => getAuthorFromCommit(x) || []),
		commits.length < perPage ? [] : await getAllCommits(page + 1),
	))];
}

const authors = getAllCommits().then((authors) => {
	const knowns = authors.filter(x => typeof x === 'string');
	const unknowns = authors.filter(x => typeof x === 'symbol' && !legacyCommitsWithUnknownAuthors.has(x.description));
	console.log(`Found ${knowns.length} authors: ${knowns.join(',')}\n`);
	if (unknowns.length > 0) {
		console.log(`${unknowns.length} commits have an unknown author: ${unknowns.map(x => x.description).join(',')}\n`);
	}
	if (legacyCommitsWithUnknownAuthors.size > 0) {
		console.log(`${legacyCommitsWithUnknownAuthors.size} commits with an unknown author are legacy: ${[...legacyCommitsWithUnknownAuthors].join(',')}\n`);
	}
	if (unknowns.length > 0) {
		throw unknowns;
	}
	return knowns;
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

const aliases = new Map([
	['bmeck', 'bfarias-godaddy'],
	['PeterJensen', 'P-Jensen'].map(x => x.toLowerCase()),
]);

function handler(kind) {
	return (data) => {
		const names = new Set(data.map(x => x.login.toLowerCase()));
		aliases.forEach((alias, main) => {
			if (names.has(main)) {
				names.add(alias);
			}
		});
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
			.map(x => x.replace(/^(https?:\/\/)?github\.com\//, '').replace(/^@/, '').toLowerCase())
			.filter(x => /^[a-z0-9_-]{1,39}$/gi.test(x))
			.sort((a, b) => a.localeCompare(b))
	);
	console.log(`Found ${usernames.size} usernames: ` + [...usernames].join(',') + '\n');
	return usernames;
});

const exceptions = new Set([
	'leebyron', // former FB delegate
	'marjaholtta', // Google employee
	'rossberg',
	'arv',
	'sideshowbarker', // Mozilla employee
	'jswalden',
	'GeorgNeis',
	'natashenka', // Google employee
	'IgorMinar', // former Google employee
].map(x => x.toLowerCase()));

// TODO: remove these as they sign the form
const legacy = new Set([
	'pacokwon',
	'himsngh',
	'angleKH',
	'ivan-pan',
	'szuend',
	'chrikrah',
	'viktmv',
	'bathos',
	'johnnyrainbow',
	'Kriyszig',
	'Tomy8s',
	'ahungry',
	'divmain',
	'RReverser',
	'him2him2',
	'jungshik',
	'tmerr',
	'v-stein',
	'nathan',
	'guimier',
	'aweary',
	'timoxley',
	'thefourtheye',
	'kdex',
	'wwwillchen',
	'jmm',
	'alrra',
	'prayagverma',
	'UltCombo',
	'ReadmeCritic',
	'dslomov',
	'DmitrySoshnikov',
	'jsreeram',
	'antony-jeong',
	'bojavou',
].map(x => x.toLowerCase()));

Promise.all([usernames, authors, delegates, emeriti]).then(([usernames, authors, delegates, emeriti]) => {
	let legacyCount = legacy.size;
	const missing = authors.filter(author => {
		const a = author.toLowerCase();
		const signed = usernames.has(a)
			|| delegates.has(a)
			|| emeriti.has(a)
			|| exceptions.has(a);
		if (legacy.has(a)) {
			if (signed) {
				legacyCount -= 1;
				console.warn(`TODO: remove ${a} from legacy list`);
			}
			return false;
		}
		return !signed;
	});
	if (legacyCount > 0) {
		console.info(`Legacy missing: ${legacyCount}`);
	}
	if (missing.length > 0) {
		throw `Missing ${missing.length} authors: ${missing}`;
	} else {
		console.log('All authors have signed the form, or are delegates or emeriti!');
	}
}).catch((e) => {
	console.error(e);
	process.exitCode = 1;
});
