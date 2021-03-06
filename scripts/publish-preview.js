'use strict';

const { join } = require('path');
const glob = require('glob').sync;
const tiny = require('tiny-json-http');
const fs = require('fs');
const zlib = require('zlib');
const tar = require('tar-stream');


async function go() {
	const { TRAVIS_PULL_REQUEST, TRAVIS_PULL_REQUEST_SHA } = process.env;

	if (!TRAVIS_PULL_REQUEST) { throw new ReferenceError('Missing env var TRAVIS_PULL_REQUEST'); }
	if (!TRAVIS_PULL_REQUEST_SHA) { throw new ReferenceError('Missing env var TRAVIS_PULL_REQUEST_SHA'); }

	const dir = join(__dirname, '..', 'out');
	const files = glob(join(dir, '**'), { nodir: true });

	if (!files.length) { throw new ReferenceError('No preview files found to publish'); }

	console.log(`Publishing preview build of PR ${TRAVIS_PULL_REQUEST} (SHA ${TRAVIS_PULL_REQUEST_SHA})`);

	const compressed = await compress(files, dir);
	console.log(`Packed to ${compressed.length / 1000}kB`);

	const data = {
		pr: TRAVIS_PULL_REQUEST,
		sha: TRAVIS_PULL_REQUEST_SHA,
		compressed,
	};

	const url = 'https://ci.tc39.es/preview/tc39/ecma262';

	const payloadSize = JSON.stringify(data).length;
	console.log(`Payload size: ${payloadSize / 1000}kB`);
	if (payloadSize >= 1000 * 1000 * 6) {
		throw Error('Payloads must be under 6MB');
	}

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
