import {resolve} from 'path';

import * as TJS from 'typescript-json-schema';

type Parameters = {
	basePath?: string;
	fullTypeName: string;
	file: string;
};

export function generate(parameters: Parameters) {
	const {basePath = '.', fullTypeName, file} = parameters;
	const settings: TJS.PartialArgs = {
		required: true
	};

	const compilerOptions: TJS.CompilerOptions = {
		strictNullChecks: true
	};

	const program = TJS.getProgramFromFiles(
		[resolve(file)],
		compilerOptions,
		basePath
	);

	const schema = TJS.generateSchema(program, fullTypeName, settings);
	return schema;
}
