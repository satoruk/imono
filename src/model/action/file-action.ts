import path from 'path';
import {existsSync, createWriteStream} from 'fs';

import Action from './action';

type CREATE_PARAMS1 = {
	path: string;
};
type CREATE_PARAMS2 = {
	/** 変数の展開されたフルキー */
	fullKey: string;
	/** 変数の展開するキー */
	key: string;
	/** アクションの対象となるファイルパス */
	path: string;
};
export type CREATE_PARAMS = CREATE_PARAMS1 | CREATE_PARAMS2;

export default class FileAction<T> extends Action<T> {
	override async execute(): Promise<void> {
		await this.pathMap(async parameters => {
			if (!existsSync(parameters.path)) {
				const ws = createWriteStream(parameters.path, {flags: 'a'});
				for await (const line of this.onCreate(parameters)) {
					ws.write(line + '\n');
				}

				ws.end();
			}
		});
	}

	async * onCreate(parameters: CREATE_PARAMS): AsyncIterableIterator<string> {
		const targetPath = path.resolve(this.context.root, parameters.path);
		console.log(`		type: ${this.config.type}`);
		console.log(`			${targetPath}`);

		yield 'foo';
	}
}
