import {Writable} from 'stream';

import {Progress} from '../../util/event';
import * as util from '../../util';

export class SchemaGenerator {
	private readonly _progress: Progress;
	constructor(
		public readonly outputSchema: Writable,
		public readonly source: string
	) {
		this._progress = new Progress('SchemaGenerator');
	}

	get emitter() {
		return this._progress.emitter;
	}

	async execute() {
		await this._progress.init('init');

		try {
			const schema = util.schema.generate({
				file: this.source,
				fullTypeName: 'ConfigVariables'
			});
			const json = JSON.stringify(schema, null, 2);
			this.outputSchema.write(json);
			this.outputSchema.on('close', async () => {
				console.log('schemaFilepath=done');
				await this._progress.done('done');
			});
			this.outputSchema.end();
		} catch (error: unknown) {
			await this._progress.fail(error);
			throw error;
		}
	}
}

