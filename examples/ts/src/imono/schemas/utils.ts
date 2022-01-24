import {toUpperCamelCase} from 'imono/dist/util/strings';

import {Model, ModelAttribute} from './variables';

type KindType = 'model' | 'primitive';

export function * attribute_entries(model: Model): IterableIterator<[string, ModelAttribute, KindType]> {
	for (const [name, attr] of Object.entries(model.attributes)) {
		const matches = /^\${model\.(.+)}$/.exec(attr.type);
		if (matches && typeof matches[1] === 'string') {
			const type = toUpperCamelCase(matches[1]);
			yield [name, {...attr, type}, 'model'];
		} else {
			// Primitive type
			yield [name, attr, 'primitive'];
		}
	}
}
