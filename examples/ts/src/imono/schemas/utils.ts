import {Model, ModelAttribute} from './variables';

export function * attributes(model: Model): Generator<[string, ModelAttribute], void> {
	for (let [name, attr] of Object.entries(model.attributes)) {
		if (typeof attr === 'string') {
			attr = {type: attr};
		}

		yield [name, attr];
	}
}
