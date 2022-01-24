import {toUpperCamelCase, toKebabCase} from 'imono/dist/util/strings';

import {matchMap} from '../text-file-action';
import {Model, attribute_entries} from '../../schemas';

type EntryPoint = {
	src: string;
	index: number;
	length: number;
};

type ImportModule = {
	location: string;
	modules: string[];
};

export 	async function defineImports(src: string, model: Model): Promise<string> {
	const patternOfImport = /^import\s+{([^}]+)}\s+from ["']([^"']+)["'];\n/gm;
	const entries = matchMap(patternOfImport, src, matched => {
		if (
			typeof matched[0] !== 'string' ||
				typeof matched[1] !== 'string' ||
				typeof matched[2] !== 'string'
		) {
			return;
		}

		const entry: EntryPoint & ImportModule = {
			index: matched.index,
			length: matched[0].length,
			location: matched[2],
			modules: matched[1].trim().split(',').map(s => s.trim()).filter(s => s.length > 0),
			src: matched[0]
		};
		return entry;
	});
	entries.sort((a, b) => a.index - b.index);

	const dict = new Map<string, ImportModule>();
	for (const v of imports(model)) {
		dict.set(v.location, v);
	}

	const newEntries: Array<EntryPoint & ImportModule> = [];
	for (const entry of entries) {
		const v = dict.get(entry.location);
		if (v) {
			const modules = [
				...entry.modules,
				...v.modules
			].filter((v, i, a) => a.indexOf(v) === i).sort();
			newEntries.push({...entry, modules});

			dict.delete(entry.location);
		}
	}

	for (const v of dict.values()) {
		newEntries.push({
			...v,
			src: '',
			index: 0,
			length: 0
		});
	}

	// TODO: これだと問題があって、新規追加のものは先頭か後方に寄せる
	newEntries.sort((a, b) => (a.index + a.length) - (b.index + b.length));

	let gap = 0;
	for (const entry of newEntries) {
		const v = `import {${entry.modules.join(', ')}} from "${entry.location}";\n`;
		const start = entry.index + gap;
		src = src.slice(0, start) + v + src.slice(start + entry.length);
		gap += v.length - entry.length;
	}

	return src;
}

export function * imports(model: Model): IterableIterator<ImportModule> {
	const importMap = new Map<string, Set<string>>();
	if (typeof model.base === 'string') {
		const target = `./${model.base}`;
		const className = toUpperCamelCase(model.base);
		const names = importMap.get(target) ?? new Set<string>();

		names.add(className);
		names.add(className + 'ConstructorParameters');
		importMap.set(target, names);
	}

	for (const [,attr, kind] of attribute_entries(model)) {
		if (kind === 'model') {
			const target = toKebabCase(attr.type) as string;
			const filepath = `./${target}`;
			const className = attr.type;
			const names = importMap.get(filepath) ?? new Set<string>();

			names.add(className);
			importMap.set(filepath, names);
		}
	}

	for (const target of Array.from(importMap.keys()).sort()) {
		const names = importMap.get(target);
		if (names) {
			const modules: ImportModule = {
				location: target,
				modules: Array.from(names)
			};
			yield modules;
		}
	}
}
