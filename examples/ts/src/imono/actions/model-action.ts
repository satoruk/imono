import FileAction from 'imono/dist/model/action/file-action';
import type {CREATE_PARAMS} from 'imono/dist/model/action/file-action';
import {Variables, Model, attributes} from '../schemas';

export default class ModelAction extends FileAction<Variables> {
	override async * onCreate(parameters: CREATE_PARAMS): AsyncIterableIterator<string> {
		if (!('key' in parameters)) {
			throw new Error('key is required');
		}

		const className = this.toUpperCamelCase(parameters.key);
		const model = this.variables.models[parameters.key];
		if (!(model)) {
			throw new Error('key  is not found at models');
		}

		yield	`// ${JSON.stringify(model)}`;
		yield	`// base: "${model.base ?? ''}"`;
		yield	`//  key: "${parameters.key}"`;
		yield	`// path: "${parameters.path}"`;
		for (const line of this.defineImports(model)) {
			yield line;
		}

		yield '';
		for (const line of this.defineInterfacesTypes(className, model)) {
			yield line;
		}

		yield '';
		for (const line of this.defineClass(className, model)) {
			yield line;
		}
	}

	* defineImports(model: Model): IterableIterator<string> {
		const importMap = new Map<string, Set<string>>();
		if (typeof model.base === 'string') {
			const target = `./${model.base}`;
			const className = this.toUpperCamelCase(model.base);
			const names = importMap.get(target) ?? new Set<string>();

			names.add(className);
			names.add(className + 'ConstructorParameters');
			importMap.set(target, names);
		}

		for (const [,attr] of attributes(model)) {
			const matches = /^\${model\.(.+)}$/.exec(attr.type);
			if (matches && typeof matches[1] === 'string') {
				const target = `./${matches[1]}`;
				const className = this.toUpperCamelCase(matches[1]);
				const names = importMap.get(target) ?? new Set<string>();

				names.add(className);
				importMap.set(target, names);
			}
		}

		for (const target of Array.from(importMap.keys()).sort()) {
			const names = importMap.get(target);
			if (names) {
				yield `import {${Array.from(names).sort().join(', ')}} from '${target}';`;
			}
		}
	}

	* defineInterfacesTypes(className: string, model: Model): IterableIterator<string> {
		let keywordExtends = '';
		if (model.base) {
			keywordExtends = ` extends ${this.toUpperCamelCase(model.base)}ConstructorParameters`;
		}

		yield `export interface ${className}ConstructorParameters${keywordExtends} {`;

		for (const line of this.defineAtteattributes(model)) {
			yield this.indent(`${line}`);
		}

		yield '}';
	}

	* defineAtteattributes(model: Model): IterableIterator<string> {
		for (const [name, attr] of attributes(model)) {
			const optional = attr.optional ? '?' : '';
			const matches = /^\${model\.(.+)}$/.exec(attr.type);
			if (matches && typeof matches[1] === 'string') {
				const type = this.toUpperCamelCase(matches[1]);
				yield `${name}${optional}: ${type};`;
			} else {
				// Primitive type
				yield `${name}${optional}: ${attr.type};`;
			}
		}
	}

	* defineClass(className: string, model: Model): IterableIterator<string> {
		if (typeof model.desc === 'string') {
			yield `/** ${className}`;
			yield ' *';
			for (const line of model.desc.trim().split('\n')) {
				yield ` * ${line}`;
			}

			yield	' */';
		} else {
			yield `/** ${className} */`;
		}

		const keywordExtends = model.base ? ` extends ${this.toUpperCamelCase(model.base)}` : '';
		yield	`export class ${className}${keywordExtends} {`;
		yield this.indent('// Attributes');
		for (const line of this.defineAtteattributes(model)) {
			yield this.indent(`public readonly ${line}`);
		}

		yield '';
		for (const line of this.defineConstructor(className, model)) {
			yield this.indent(`${line}`);
		}

		yield '}';
	}

	* defineConstructor(className: string, model: Model): IterableIterator<string> {
		yield '// Constructor';
		yield `constructor(parameters: ${className}ConstructorParameters) {`;
		if (model.base) {
			yield this.indent('super(parameters);');
		}

		for (const [name] of attributes(model)) {
			yield this.indent(`this.${name} = parameters.${name};`);
		}

		yield '}';
	}
}
