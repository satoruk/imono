import path from 'path';

import {Progress} from '../../util/event';
import * as config from '../../model/config';
import {Context} from '../../model/context';
import {Action, PRIMITIVE_ACTIONS} from '../../model/action';

/**
 * 何かしら定義されてれば、NonNullableと判断するアサーション
 * @param val 何かの値
 */
export function assertsDefined<T>(value: T): asserts value is NonNullable<T> {
	if (value === undefined) {
		throw new TypeError('Expected "value" to be defined, but received undefined');
	}

	if (value === null) {
		throw new TypeError('Expected "value" to be defined, but received null');
	}
}

export class Apply {
	private readonly _progress: Progress;

	constructor(public readonly context: Context<unknown>) {
		this._progress = new Progress('apply');
	}

	get emitter() {
		return this._progress.emitter;
	}

	async execute() {
		await this._progress.init('init');
		await this._progress.done('done', async () => {
			await this.apply(this._progress.childSync(0.99, 'apply'));
		});
	}

	async apply(emitter: Progress) {
		await emitter.init('apply');
		await emitter.done('done', async () => {
			const plansEmitter = await emitter.child(1, 'plans', Object.keys(this.context.plan).length);
			await plansEmitter.init('init');

			let i = 0;
			for await (const [planKey, plan] of Object.entries(this.context.plan)) {
				await plansEmitter.progress(i, `plan: ${planKey}`);
				i++;

				console.log(plan);
				const name = plan.name ?? planKey;
				const actionsEmitter = await plansEmitter.child(i, name, plan.actions.length);
				await actionsEmitter.init('init');
				for await (const [j, action] of plan.actions.entries()) {
					await this.applyAction(actionsEmitter.childSync(j, action.name), action);
				}

				await actionsEmitter.done('done');
			}

			await plansEmitter.done('done');
		});
	}

	async applyAction(emitter: Progress, action: config.schema.Action) {
		try {
			await emitter.init('init');
			await emitter.progress(0, 'resolve action');
			const targetAction = this.resolveAction(action);
			await emitter.progress(0.2, 'execute action');
			await targetAction.execute(emitter.childSync(0.8, 'execute'));
			await emitter.done('done');
		} catch (error: unknown) {
			await emitter.fail(error);
			throw error;
		}
	}

	resolveAction(action: config.schema.Action) {
		if (action.type in PRIMITIVE_ACTIONS) {
			const primitiveKey = action.type as keyof typeof PRIMITIVE_ACTIONS;
			const TargetAction = PRIMITIVE_ACTIONS[primitiveKey];
			return new TargetAction(action, this.context);
		}

		const implPath = path.resolve(this.context.root, action.type);
		/* eslint-disable @typescript-eslint/no-var-requires */
		const TargetAction = require(implPath).default as typeof Action;
		/* eslint-enable @typescript-eslint/no-var-requires */
		return new TargetAction(action, this.context);
	}
}

