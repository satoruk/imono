import {promises as fs, existsSync} from 'fs';
import path from 'path';
import util from 'util';

import handlebars from 'handlebars';
import YAML from 'yaml';

import * as imono from '../../../../src';
import * as variablesSchema from './schemas/variables';

async function toVariables(path: string) {
	const raw = await fs.readFile(path, 'utf8');
	const data = YAML.parse(raw);
	return variablesSchema.Convert.toVariables(data);
}

const actionStrategies: ActionStrategy[] = [];
function registerActionStrategy(strategy: ActionStrategy) {
	actionStrategies.push(strategy);
}

async function executeActionStrategy(
	action: planSchema.Action,
	variables: variablesSchema.Variables
) {
	for (const strategy of actionStrategies) {
		if (strategy.canHandle(action)) {
			return strategy.execute(action, variables);
		}
	}

	throw new Error(`No strategy found for action: ${action.name}`);
}

abstract class ActionStrategy {
	abstract execute(
		action: planSchema.Action,
		variables: variablesSchema.Variables
	): Promise<void>;
	abstract canHandle(action: planSchema.Action): boolean;
}

class DirectoryCreationActionStrategy extends ActionStrategy {
	async execute(
		action: planSchema.Action,
		variables: variablesSchema.Variables
	): Promise<void> {
		console.log(`action:${action.type}`);
	}

	canHandle(action: planSchema.Action): boolean {
		return action.type == 'directory';
	}
}

class FileCreationActionStrategy extends ActionStrategy {
	async execute(
		action: planSchema.Action,
		variables: variablesSchema.Variables
	): Promise<void> {
		console.log(`action:${action.type}`);
	}

	build_path(action: planSchema.Action, parameters: unknown): string {
		const template = handlebars.compile(action.path);
		return template(parameters);
	}

	foo(
		path: string,
		action: planSchema.Action,
		variables: variablesSchema.Variables
	): void {
		if (existsSync(path)) {
			console.log(`  exists: ${path}`);
			return;
		}

		console.log(`  not exists: ${path}`);
	}

	canHandle(action: planSchema.Action): boolean {
		return action.type == 'file';
	}
}

class ModelCreationActionStrategy extends FileCreationActionStrategy {
	// TODO: 値を引き摺り回すのは頭が悪いので、コンテキストを用意してそこから取得する方がコンパクトになりそう
	async execute(
		action: planSchema.Action,
		variables: variablesSchema.Variables
	): Promise<void> {
		console.log(`action:${action.type}`);
		for (const model in variables.models) {
			if (model in variables.models) {
				console.log(`  model:${model}`);
				const path = this.build_path(action, {name: model});
				console.log(`     path:${path}`);
				this.foo(path, action, variables);
			}
		}
	}

	canHandle(action: planSchema.Action): boolean {
		return action.type == 'model';
	}
}

registerActionStrategy(new DirectoryCreationActionStrategy());
registerActionStrategy(new FileCreationActionStrategy());
registerActionStrategy(new ModelCreationActionStrategy());

async function actions(
	name: string,
	actions: planSchema.Action[],
	variables: variablesSchema.Variables
) {
	console.log(`GENERATOR:${name}`);

	for (const action of actions) {
		executeActionStrategy(action, variables);
	}
}

async function main() {
	const configPath = 'examples/ts/imono.yaml';
	const basePath = path.dirname(configPath);

	const raw = await fs.readFile(configPath, 'utf8');
	const imono = YAML.parse(raw);
	const planPath: string = path.join(basePath, imono.plans);
	const variablesPath: string = path.join(basePath, imono.variables);

	const plan = await imono.loadPlan(planPath);
	const variables = await toVariables(variablesPath);

	actions(plan.generators.ddd.name, plan.generators.ddd.actions, variables);

	console.log('foo');
}

main();
