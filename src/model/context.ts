import * as config from './config';

export class Context<V> {
	constructor(
		/** Plan */
		public readonly config: config.schema.Config,
		public readonly plan: Record<string, config.schema.Plan>,
		public readonly root: string,
		public readonly variables: V
	) {}
}
