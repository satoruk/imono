#!/usr/bin/env node
import {promises as fs} from 'fs';

import * as util from '../util';

async function main() {
	console.log('Generating schema');
	const schema = util.schema.generate({
		file: 'src/model/config/schema.ts',
		fullTypeName: 'Config'
	});
	const json = JSON.stringify(schema, null, 2);
	await fs.writeFile('imono-schema.json', json);
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
