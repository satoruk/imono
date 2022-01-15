import {promises as fs, existsSync} from 'fs';

import {Progress} from '../../util';

import Action from './action';

export default class RemoveAction<T> extends Action<T> {
	override async execute(emitter: Progress): Promise<void> {
		await emitter.done('remove action', async () => {
			await this.pathMap(async parameters => {
				if (existsSync(parameters.path)) {
					const stat = await fs.lstat(parameters.path);
					if (stat.isDirectory() || stat.isFile()) {
						await fs.rm(parameters.path, {recursive: true});
						console.log(`removed dir ${parameters.path}`);
						return;
					}

					let targetType = 'unknown';
					if (stat.isBlockDevice()) {
						targetType = 'block device';
					} else if (stat.isCharacterDevice()) {
						targetType = 'character device';
					} else if (stat.isSymbolicLink()) {
						targetType = 'symbolic link';
					} else if (stat.isFIFO()) {
						targetType = 'FIFO';
					} else if (stat.isSocket()) {
						targetType = 'socket';
					}

					console.error(`${parameters.path} is ${targetType}`);
					throw new Error(`${parameters.path} is ${targetType}`);
				} else {
					console.log(`${parameters.path} is not exists`);
				}
			});
		});
	}
}
