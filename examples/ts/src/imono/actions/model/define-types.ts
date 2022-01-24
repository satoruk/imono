import {toUpperCamelCase} from 'imono/dist/util/strings';

import {Model, attribute_entries} from '../../schemas';

export async function defineTypes(_src: string, className: string, model: Model): Promise<string> {
	let keywordExtends = '';
	if (model.base) {
		keywordExtends = ` extends ${toUpperCamelCase(model.base)}ConstructorParameters`;
	}

	const lines: string[] = [];
	lines.push(`export interface ${className}ConstructorParameters${keywordExtends} {`);

	for (const [name, attr] of attribute_entries(model)) {
		const optional = attr.optional ? '?' : '';
		lines.push(`  ${name}${optional}: ${attr.type}`);
	}

	lines.push('}');
	return lines.join('\n') + '\n';
}
