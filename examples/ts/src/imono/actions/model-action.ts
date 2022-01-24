import {FileActionParameters} from 'imono/dist/model/action/file-action';

import {Variables} from '../schemas';

import TextFileAction, {renderSection} from './text-file-action';
import {defineImports, defineTypes, defineClass} from './model';

export default class ModelAction extends TextFileAction<Variables> {
	override async apply(src: string, parameters: FileActionParameters): Promise<string> {
		if (!('key' in parameters)) {
			throw new Error('key is required');
		}

		const key = parameters.key as string;
		const className = this.toUpperCamelCase(key);
		const model = this.variables.models[key];
		if (!(model)) {
			throw new Error('key  is not found at models');
		}

		let insertPosition = 0;

		{
			// Define imports
			const options = {
				start: '// imports',
				end: '// end of imports',
				position: insertPosition
			};
			src = await renderSection(src, options, async section => {
				const define = await defineImports(section.content, model);
				insertPosition = section.sectionPosition + section.section.length + (define.length - section.content.length);
				return define;
			});
		}

		console.log(`insertPosition: ${insertPosition} after imports`);

		{
			// Define interfaces and types
			const options = {
				start: '// interfaces and types',
				end: '// end of interfaces and types',
				position: insertPosition
			};
			src = await renderSection(src, options, async section => {
				const define = await defineTypes(src, className, model);
				insertPosition = section.sectionPosition + section.section.length + (define.length - section.content.length);
				return define;
			});
		}

		console.log(`insertPosition: ${insertPosition} after interfaces and types`);

		{
			// Define model class
			const options = {
				start: '// model class',
				end: '// end of model class',
				position: insertPosition
			};
			src = await renderSection(src, options, async section => {
				const define = await defineClass(src, className, model);
				insertPosition = section.sectionPosition + section.section.length + (define.length - section.content.length);
				return define;
			});
		}

		return src;
	}
}
