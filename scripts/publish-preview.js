'use strict';

const { join } = require('path');
const glob = require('glob').sync;
const tiny = require('tiny-json-http');
const fs = require('fs');
const zlib = require('zlib');
const tar = require('tar-stream');


async function go() {
	const {
		PULL_REQUEST,
		GITHUB_HEAD_SHA,
		GITHUB_REPOSITORY = 'tc39/ecma262',
	} = process.env;

	if (!PULL_REQUEST) { throw new ReferenceError('Missing env var PULL_REQUEST'); }
	if (!GITHUB_HEAD_SHA) { throw new ReferenceError('Missing env var GITHUB_HEAD_SHA'); }

	const dir = join(__dirname, '..', 'out');
	const files = glob(join(dir, '**'), { nodir: true });

	if (!files.length) { throw new ReferenceError('No preview files found to publish'); }

	console.log(`Publishing preview build of PR ${PULL_REQUEST} (SHA ${GITHUB_HEAD_SHA})`);

	const compressed = await compress(files, dir);
	console.log(`Packed to ${compressed.length / 1000}kB`);

	const data = {
		pr: PULL_REQUEST,
		sha: GITHUB_HEAD_SHA,
		compressed,
	};

	const [user, repo] = GITHUB_REPOSITORY.split('/');
	const url = `https://ci.tc39.es/preview/${user}/${repo}`;

	const payloadSize = JSON.stringify(data).length;
	console.log(`Payload size: ${payloadSize / 1000}kB`);
	if (payloadSize >= 1000 * 1000 * 6) {
		throw Error('Payloads must be under 6MB');
	}

	console.log(`URL posted to: ${url}`);
	await tiny.post({ url, data });
	console.log('Sent to preview!')
}

async function compress(files, basedir) {
	return new Promise((resolve, reject) => {
		files = [...files];
		const pack = tar.pack();

		const compressStream = zlib.createBrotliCompress({
			params: {
				[zlib.constants.BROTLI_PARAM_QUALITY]: 5, // 30% larger and 100x faster than the default (11)
			}
		});

		pack.on('error', reject);

		function packEntry(err) {
			if (err) {
				reject(err);
				return;
			}
			if (files.length === 0) {
				pack.finalize();
				return;
			}

			const file = files.pop();
			const name = file.replace(basedir, '').slice(1);
			const size = fs.statSync(file).size;
			console.log(`Packaging: ${name} (${size / 1000}kB)`);

			const entry = pack.entry({ name, size }, packEntry);

			const readStream = fs.createReadStream(file);

			readStream.on('error', reject);
			readStream.pipe(entry);
		}
		packEntry();

		const stream = pack.pipe(compressStream);
		const chunks = [];
		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
	});
}


go().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
