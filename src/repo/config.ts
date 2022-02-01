import {existsSync} from 'fs';

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
