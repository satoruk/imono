import React, {FC, useEffect, useState} from 'react';
import {Text} from 'ink';

import * as core from '../../core';
import {Context} from '../../model/context';

import {errorToString} from './utils';

type Progress = {
	depth: number;
	isError: boolean;
	message: string;
	name: string;
	namespace: string;
	rate: number;
};


function formatPercent(value: number) {
	const formatter = new Intl.NumberFormat('ja', {
		style: 'percent',
		maximumSignificantDigits: 3
	});
	return formatter.format(value);
}


interface ApplyProps {
	context: Context<unknown>;
}
export const Apply: FC<ApplyProps> = props => {
	const [state, setState] = useState<Record<string, Progress>>({});
	useEffect(() => {
		const o = new core.apply.Apply(props.context);
		const emmiter = o.emitter;
		emmiter.on('init', (namespace, name) => {
			setState(s => ({...s, [namespace]: {
				depth: namespace.split('.').length - 1,
				isError: false,
				message: 'init',
				name,
				namespace,
				rate: 0
			}}));
		});
		emmiter.on('done', (namespace, name) => {
			setState(s => ({...s, [namespace]: {
				depth: namespace.split('.').length - 1,
				isError: false,
				message: 'done',
				name,
				namespace,
				rate: 1
			}}));
		});
		emmiter.on('fail', (namespace, name, error) => {
			setState(s => ({...s, [namespace]: {
				depth: namespace.split('.').length - 1,
				isError: true,
				message: errorToString(error),
				name,
				namespace,
				rate: s[namespace]?.rate ?? 0
			}}));
		});
		o.execute().catch(error => {
			console.error(errorToString(error));
		});
		return () => {
			console.log('----------------------   jsx unmount');
		};
	}, [props.context]);

	return (
		<>
			<Text color="green">apply</Text>
			{Object.entries(state).map(([namespace, progress]) => (
				<Text key={namespace} color={progress.isError ? 'red' : 'green'}>
					{namespace.padEnd(15, ' ')}
					{' | '}
					{formatPercent(progress.rate).padStart(4, ' ')}{' '}
					{' | '}
					{''.padEnd(progress.depth, ' ')}
					{progress.depth > 0 ? '+ ' : '  '}
					{progress.name.padEnd(30 - progress.depth, ' ')}
					{progress.message}
				</Text>
			))}
		</>
	);
};
