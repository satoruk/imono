import {promises as fs, existsSync, readFileSync} from 'fs';
import {resolve} from 'path';

import Ajv from 'ajv';
import YAML from 'yaml';

import * as config from '../model/config';

const CANDIDATES = [
	'imono.yaml',
	'imono.yml',
	'config/imono.yaml',
	'config/imono.yml'
];

export function detectConfigPath(base: string) {
	for (const candidate of CANDIDATES) {
		const path = `${base}/${candidate}`;
		if (existsSync(path)) {
			return path;
		}
	}

	throw new Error('Config file not found at imono config file');
}

export function assertsConfig(data: unknown): asserts data is config.schema.Config {
	const ajv = new Ajv();
	const schema = readFileSync(resolve(__dirname, '../../imono-schema.json'), 'utf8');
	const validate = ajv.compile(JSON.parse(schema));
	const valid = validate(data);
	if (!valid) {
		console.error(validate.errors);
		throw new TypeError('Invalid config file');
	}
}

export async function loadConfig(path: string) {
	const data = await loadYaml(path);
	try {
		assertsConfig(data);
	} catch (error: unknown) {
		throw new TypeError(`${String(error)}: ${path}`);
	}

	return data;
}

export async function loadYaml(path: string) {
	const raw = await fs.readFile(path, 'utf8');
	return YAML.parse(raw);
}
