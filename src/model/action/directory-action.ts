import {promises as fs, existsSync} from 'fs';

import {Progress} from '../../util';
import Action from './action';

export default class DirectoryAction<T> extends Action<T> {
	override async execute(emitter: Progress): Promise<void> {
		await emitter.init('directory action');
		try {
			await this.pathMap(async parameters => {
				await this.createDir(parameters.path, emitter.childSync(1, parameters.path));
			});
			await emitter.done('directory action');
		} catch (error: unknown) {
			await emitter.fail(error);
		}
	}

	async createDir(filePath: string, emitter: Progress): Promise<void> {
		await emitter.init('init');
		await emitter.done('done', async () => {
			if (existsSync(filePath)) {
				const stat = await fs.lstat(filePath);
				if (stat.isDirectory()) {
					console.log(`${filePath} is directory`);
				} else {
					throw new Error(`${filePath} is not directory`);
				}
			} else {
				await fs.mkdir(filePath, {recursive: true});
				console.log(`created dir ${filePath}`);
			}
		});
	}
}
