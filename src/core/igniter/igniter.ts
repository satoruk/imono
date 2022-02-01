import path from 'path';

import {load} from '../../util/schema';
import * as config from '../../model/config';

import {Progress} from '../../util/event';
import {detectConfigPath} from '../../repo/config';
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
			await this.prepare(this.progress.childSync(0.2, 'prepare'));
			await this.progress.progress(0.2, 'load config');
			const configPath = detectConfigPath(this.base);
			const config = await load<config.schema.Config>(
				configPath,
				path.resolve(__dirname, '../../../imono-schema.json')
			);

			await this.progress.progress(0.5, 'load variables config');
			const root = path.resolve(path.dirname(configPath), config.base ?? '.');
			const variables = await load<unknown>(
				path.join(root, config.variable.config),
				path.join(root, config.variable.schema)
			);

			// 正規化するための関数があれば取得する
			const src = path.join(root, config.variable.source);
			/* eslint-disable @typescript-eslint/no-var-requires */
			let normalizate = require(src).normalizate as Normalizate;
			/* eslint-enable @typescript-eslint/no-var-requires */
			if (typeof normalizate !== 'function') {
				normalizate = (v: unknown) => v;
			}

			// 正規化する
			const normalizatedVariables = normalizate(variables);

			await this.progress.progress(0.8, 'create context');
			return new Context<unknown>(config, config.plan, root, normalizatedVariables);
		});
	}

	async prepare(emitter: Progress) {
		await emitter.init('apply');
		await emitter.done('done', async () => {
			await emitter.progress(0.1, 'setup ts-node register');
			try {
			/* eslint-disable @typescript-eslint/no-var-requires */
				// require('ts-node/register');
				require('ts-node/register/transpile-only');
				// Require('ts-node').register({
				/*
				CompilerOptions: {
					module: 'CommonJS'
				}
				// */
				// });
			// Registerer.enabled(true);
			// Registerer = require('ts-node').register({
			// 	compilerOptions: {
			// 		module: 'CommonJS'
			// 	}
			// });
			/* eslint-enable @typescript-eslint/no-var-requires */
			} catch (error: unknown) {
				if (assertError(error) && error.code === 'MODULE_NOT_FOUND') {
					throw new Error(
						`Imono: 'ts-node' is required for the TypeScript configuration files. Make sure it is installed\nError: ${error.message}`
					);
				}

				throw error;
			}
		});
	}
}

interface HasCode {
	code?: unknown;
}
type Normalizate = (value: unknown) => unknown;

function assertError<T>(value: T): value is T & Error & HasCode {
	return typeof value === 'object' && value !== null && value instanceof Error;
}
