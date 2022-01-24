import fs from 'fs';
import util from 'util';
import {Readable, Transform} from 'stream';

import Action, {ActionParameters} from './action';

export type FileActionParameters = ActionParameters;

const rename = util.promisify(fs.rename);

export default class FileAction<T> extends Action<T> {
	override async execute(): Promise<void> {
		console.log('AAAAAAAAAAAAA');
		await this.pathMap(async parameters => {
			const transform = await this.transform(parameters);
			const tmppath = parameters.path + '.tmp';
			const dest = fs.createWriteStream(tmppath, {flags: 'w'});
			const src = createReadableStream(parameters.path);
			await new Promise((resolve, reject) => {
				console.log('promise start');
				src.pipe(transform).pipe(dest).on('finish', () => {
					console.log('promise success');
					resolve('success');
				}).on('error', () => {
					console.error('promise error');
					reject();
				});
			});
			await rename(tmppath, parameters.path);
		});
	}

	async transform(_parameters: FileActionParameters): Promise<Transform> {
		throw new Error('Method not implemented.');
	}
}

function createReadableStream(path: string): Readable {
	if (fs.existsSync(path)) {
		return fs.createReadStream(path);
	}

	return Readable.from([]);
}
