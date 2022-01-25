import {rename as rename1, mkdir as mkdir1, lstat as lstat1, existsSync, createWriteStream, createReadStream} from 'fs';
import {dirname} from 'path';
import util from 'util';
import {Readable, Transform} from 'stream';

import Action, {ActionParameters} from './action';

export type FileActionParameters = ActionParameters;

const rename = util.promisify(rename1);
const mkdir = util.promisify(mkdir1);
const lstat = util.promisify(lstat1);

export default class FileAction<T> extends Action<T> {
	override async execute(): Promise<void> {
		await this.pathMap(async parameters => {
			await this.createDir(parameters.path);
			const transform = await this.transform(parameters);
			const tmppath = parameters.path + '.tmp';
			const dest = createWriteStream(tmppath, {flags: 'w'});
			const src = createReadableStream(parameters.path);
			await new Promise((resolve, reject) => {
				src.pipe(transform).pipe(dest).on('finish', () => {
					resolve('success');
				}).on('error', error => {
					console.error(error);
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

	async createDir(filePath: string): Promise<void> {
		const dir = dirname(filePath);
		if (existsSync(dir)) {
			const stat = await lstat(dir);
			if (!stat.isDirectory()) {
				throw new Error(`"${dir}" is not directory`);
			}
		} else {
			await mkdir(dir, {recursive: true});
		}
	}
}

function createReadableStream(path: string): Readable {
	if (existsSync(path)) {
		return createReadStream(path);
	}

	return Readable.from([]);
}
