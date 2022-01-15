import {promises as fs} from 'fs';

import YAML from 'yaml';

import {asserts} from './asserts';

export async function load<T>(path: string, schemaPath: string): Promise<T> {
	const raw = await fs.readFile(path, 'utf8');
	const data = YAML.parse(raw);
	const rawSchema = await fs.readFile(schemaPath, 'utf8');
	try {
		asserts(data, JSON.parse(rawSchema));
	} catch (error: unknown) {
		throw new TypeError(String(error) + `: ${path}`);
	}

	return data as T;
}
