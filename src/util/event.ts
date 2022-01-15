import {EventEmitter} from 'events';

import {delay} from './time';

type Callback<P extends unknown[], R> = (...args: P) => Promise<R>;

export interface ProgressEmitter {
	emit(eventName: 'fail', namespace: string, name: string, error: unknown): boolean;
	emit(eventName: 'init' | 'done', namespace: string, name: string): boolean;
	emit(eventName: 'progress', namespace: string, name: string, rate: number, message: null | string): boolean;

	on(eventName: 'fail', listener: (namespace: string, name: string, error: unknown) => void): this;
	on(eventName: 'init' | 'done', listener: (namespace: string, name: string) => void): this;
	on(eventName: 'progress', listener: (namespace: string, name: string, rate: number, message: null | string) => void): this;
}
export class ProgressEmitter extends EventEmitter {}

/**
 * 処理したタスクの割合で進捗を管理
 */
export class Progress {
	private _currentProgress: number;
	private readonly _children: Progress[];
	private readonly _max: number;
	private readonly _name: string;
	private readonly _namespace: string;
	private readonly _emitter: ProgressEmitter;

	constructor(
		name: string,
		max = 1,
		namespace = '0',
		emitter?: ProgressEmitter | null
	) {
		this._children = [];
		this._currentProgress = 0;
		this._max = max;
		this._name = name;
		this._namespace = namespace;
		if (emitter) {
			this._emitter = emitter;
		} else {
			this._emitter = new ProgressEmitter();
			this._emitter.setMaxListeners(0);
		}
	}

	public async child(progress: number, name: string, max?: number): Promise<Progress>;
	public async child<R>(progress: number, name: string, callback: Callback<[Progress], R>): Promise<R>;
	public async child<R>(progress: number, name: string, max: number, callback: Callback<[Progress], R>): Promise<R>;
	public async child<R>(progress: number, name: string, ...args: [max_or_callback?: number | Callback<[Progress], R>] | [max: number, callback: Callback<[Progress], R>]) {
		const max = 1;

		if (args.length === 1) {
			if (typeof args[0] === 'number') {
				return this._child<Progress>(progress, name, args[0]);
			}

			if (typeof args[0] === 'function') {
				return this._child(progress, name, max, args[0]);
			}

			return this._child<Progress>(progress, name, max);
		}

		if (args.length === 2) {
			return this._child(progress, name, args[0], args[1]);
		}

		return this._child<Progress>(progress, name, max);
	}

	public async done(message: string): Promise<void>;
	public async done<R>(message: string, callback: Callback<unknown[], R>): Promise<R>;
	public async done<R>(message: string, callback?: Callback<unknown[], R>) {
		await delay(100);
		if (!callback) {
			this.doneSync(message);
			return;
		}

		try {
			const result = await callback();
			this.doneSync(message);
			return result;
		} catch (error: unknown) {
			this.failSync(error);
			throw error;
		}
	}

	public async fail(error: unknown) {
		this.failSync(error);
	}

	public async init(message: string) {
		this.initSync(message);
	}

	public async progress(value: number, message: string) {
		this.progressSync(value, message);
	}

	public childSync(progress: number, name: string, max = 1): Progress {
		const namespace = `${this._namespace}.${this._children.length}`;
		const child = new Progress(name, max, namespace, this._emitter);
		this._children.push(child);
		this._emitter.on('progress', (ns, _name, rate, message) => {
			if (namespace !== ns) {
				return;
			}

			this.progressSync(rate * progress, message ?? name);
		});
		this._emitter.on('done', ns => {
			if (namespace === ns) {
				this.progressSync(progress, name);
			}
		});
		return child;
	}

	public doneSync(message: string) {
		this.progressSync(this._max, message);
		this._emitter.emit('done', this._namespace, this._name);
	}

	public failSync(error: unknown) {
		this._emitter.emit('fail', this._namespace, this._name, error);
	}

	public initSync(message: string) {
		this._emitter.emit('init', this._namespace, this._name);
		this.progressSync(0, message);
	}

	public progressSync(value: number, message: string) {
		this._currentProgress = Math.min(value, this._max);
		const v = this._currentProgress / this._max;
		this._emitter.emit('progress', this._namespace, this._name, v, message);
	}

	public get emitter() {
		return this._emitter;
	}

	private async _child<R>(progress: number, name: string, max: number, callback?: Callback<[Progress], R>) {
		if (!callback) {
			return this;
		}

		const child = this.childSync(progress, name, max);
		try {
			const result = await callback(child);
			child.doneSync(name);
			return result;
		} catch (error: unknown) {
			this.failSync(error);
			throw error;
		}
	}
}
