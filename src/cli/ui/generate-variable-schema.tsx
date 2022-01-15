import fs from 'fs';

import React, {FC, useEffect} from 'react';
import {Text} from 'ink';

import * as core from '../../core';
import {Context} from '../../model/context';

import {errorToString} from './utils';

interface GenerateVariableSchemaProps {
	context: Context<unknown>;
}
export const GenerateVariableSchema: FC<GenerateVariableSchemaProps> = props => {
	useEffect(() => {
		const schemaFilepath = props.context.config.variable.schema;
		const source = props.context.config.variable.source;
		const writable = fs.createWriteStream(schemaFilepath);
		const o = new core.variables.SchemaGenerator(writable, source);
		o.execute().catch(error => {
			console.error(errorToString(error));
		});

		return () => {
			console.log('----------------------   jsx unmount');
		};
	}, [props.context]);
	return <Text color="green">Generate Variable Schema</Text>;
};

