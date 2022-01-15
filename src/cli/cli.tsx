#!/usr/bin/env node
import 'source-map-support/register';
import React from 'react';
import {render} from 'ink';
import meow from 'meow';

import * as core from '../core';

import * as ui from './ui';

const cli = meow(
	`
	Usage
	  $ imono

	Options
		--init
		--generate-variable-schema

	Examples
	  $ imono
`,
	{
		flags: {
			currentDir: {
				type: 'string'
			},
			generateVariableSchema: {
				type: 'boolean',
				default: false
			},
			init: {
				type: 'boolean',
				default: false
			}
		}
	}
);

async function main() {
	const igniter = new core.igniter.Igniter(cli.flags.currentDir);
	const context = await igniter.execute();
	process.chdir(context.root);

	if (cli.flags.generateVariableSchema) {
		render(<ui.GenerateVariableSchema context={context}/>);
	} else if (cli.flags.init) {
		render(<ui.Init context={context}/>);
	} else {
		render(<ui.Apply context={context}/>);
	}
}

main().catch(error => {
	console.error(error);
});
