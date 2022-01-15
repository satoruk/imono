import path from 'path';

import {Progress} from '../../util/event';
import {detectConfigPath, loadConfig, loadYaml} from '../../repo/config';
import {Context} from '../../model/context';

export class Igniter {
	private readonly progress: Progress;
	private readonly base: string;

	constructor(base?: string) {
		this.base = base ? base : process.cwd();
		this.progress = new Progress('igniter');
	}

	get emitter() {
		return this.progress.emitter;
	}

	async execute() {
		await this.progress.init('init');
		return this.progress.done('done', async () => {
			await this.progress.progress(0.1, 'load config');
			const configPath = detectConfigPath(this.base);
			const config = await loadConfig(configPath);

			await this.progress.progress(0.5, 'load variables config');
			const root = path.resolve(path.dirname(configPath), config.base ?? '.');
			const variables = await loadYaml(path.join(root, config.variable.config));

			await this.progress.progress(0.8, 'create context');

			return new Context<unknown>(config, config.plan, root, variables);
		});
	}
}
