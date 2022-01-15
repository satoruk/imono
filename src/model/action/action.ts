import Handlebars from 'handlebars';

import camelCase from 'lodash/camelCase';
import get from 'lodash/get';
import repeat from 'lodash/repeat';
import upperFirst from 'lodash/upperFirst';

import * as config from '../config';
import {Context} from '../context';
import {Progress} from '../../util/event';

type PATH_MAP_CALLBACK_PARAMS1 = {path: string};
type PATH_MAP_CALLBACK_PARAMS2 = {path: string; key: string; fullKey: string};
type PATH_MAP_CALLBACK = (parameters: PATH_MAP_CALLBACK_PARAMS1 | PATH_MAP_CALLBACK_PARAMS2) => Promise<void>;

export default class Action<T> {
	constructor(
		public readonly config: config.schema.Action,
		public readonly context: Context<T>
	) {}

	async execute(emitter: Progress): Promise<void> {
		emitter.init(this.config.name);
		const error = new Error('Not implemented');
		emitter.fail(error);
		throw error;
	}

	/** Path を展開されたものを callback に渡す
   *
   * configの key があればpathが展開されて複数回 callback が呼ばれる
   *
   * key がない場合はテンプレートとして展開されず1回のみ callback が呼ばれる
   *
   */
	async pathMap(callback: PATH_MAP_CALLBACK): Promise<void> {
		if (this.config.key) {
		  const pathTemplate = Handlebars.compile(this.config.path);
			/* eslint-disable_foo typescript-eslint/no-unsafe-argument */
			const v = get(this.context.variables, this.config.key) as Record<string, unknown>;
			/* eslint-enable_foo @typescript-eslint/no-unsafe-argument */
			for (const key of Object.keys(v)) {
				const filePath = pathTemplate({key, context: this.context});
			  await callback({
					fullKey: `${this.config.key}.${key}`,
					key,
					path: filePath
				});
			}
		} else {
			await callback({path: this.config.path});
		}
	}

	public toUpperCamelCase(value: string): string {
		return upperFirst(camelCase(value));
	}

	public indent(value: string, indent = 1): string {
		return repeat('\t', Math.max(0, indent)) + value;
	}

	get variables(): T {
		return this.context.variables;
	}
}
