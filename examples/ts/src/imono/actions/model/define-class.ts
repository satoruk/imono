import {toUpperCamelCase, indent, wrap} from 'imono/dist/util/strings';

import {Model, attribute_entries} from '../../schemas';

export async function	defineClass(_src: string, className: string, model: Model): Promise<string> {
	const lines: string[] = [];

	if (typeof model.desc === 'string') {
		lines.push(
			`/** ${className}`,
			' *',
			wrap(model.desc.trim(), {prefix: ' * '}),
		  ' */');
	} else {
		lines.push(`/** ${className} */`);
	}

	const keywordExtends = model.base ? ` extends ${toUpperCamelCase(model.base)}` : '';
	lines.push(
		`export class ${className}${keywordExtends} {`,
		'  // Attributes'
	);
	for (const [name, attr] of attribute_entries(model)) {
		const optional = attr.optional ? '?' : '';
		lines.push(`  public readonly ${name}${optional}: ${attr.type};`);
	}

	lines.push(
		'',
		indent(await defineConstructor(className, model)),
		'}'
	);
	return lines.join('\n') + '\n';
}

async function defineConstructor(className: string, model: Model): Promise<string> {
	const lines: string[] = [];
	lines.push(
		'// Constructor',
		`constructor(parameters: ${className}ConstructorParameters) {`
	);
	if (model.base) {
		lines.push('super(parameters);');
	}

	for (const [name] of attribute_entries(model)) {
		lines.push(`this.${name} = parameters.${name};`);
	}

	lines.push('}');
	return lines.join('\n') + '\n';
}
