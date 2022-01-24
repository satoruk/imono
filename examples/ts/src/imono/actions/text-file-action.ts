import {Transform, TransformCallback} from 'stream';

import FileAction, {FileActionParameters} from 'imono/dist/model/action/file-action';

export default class TextFileAction<T> extends FileAction<T> {
	override async transform(parameters: FileActionParameters): Promise<Transform> {
		const apply = async (src: string) => this.apply(src, parameters);
		let buff = '';
		return new Transform({
			readableObjectMode: true,
			transform(chunk: Buffer | string, _encoding: string, callback: TransformCallback) {
				buff += chunk.toString();
				callback();
			},
			final(callback: (error?: Error | null) => void) {
				apply(buff).then(result => {
					this.push(result);
				}).finally(() => {
					callback();
				});
			}
		});
	}

	async apply(_src: string, _parameters: FileActionParameters): Promise<string> {
		throw new Error('not implemented');
	}
}

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function matchMap<T>(pattern: RegExp, src: string, func: (matched: RegExpExecArray) => T | undefined): T[] {
	const results: T[] = [];
	let matched: RegExpExecArray | null;
	while ((matched = pattern.exec(src)) !== null) {
		const v = func(matched);
		if (typeof v !== 'undefined') {
			results.push(v);
		}
	}

	return results;
}

type SectionOptions = Readonly<{
	start: string;
	end: string;
	position?: number;
}>;
type Section = Readonly<{
	content: string;
	contentPosition: number;
	indent: string;
	section: string;
	sectionPosition: number;
}>;
/** セクションの取得
 *
 * `start` marker が見つからない場合は `position` の値は `-1` を返す
 * `end` marker が見つからない場合は例外を投げます
 */
export function section(src: string, options: SectionOptions): Section {
	const {start, end, position = 0} = options;
	const patternStartMarker = new RegExp(`^([\\t ]*)${escapeRegExp(start)}\\n`, 'm');
	let result = patternStartMarker.exec(src.slice(position));
	if (result === null) {
		return {
			content: '',
			contentPosition: -1,
			indent: '',
			section: '',
			sectionPosition: -1
		};
	}

	const startMarkerLine = result[0] ?? '';
	const indent = result[1] ?? '';
	const sectionPosition = position + result.index;
	const contentPosition = sectionPosition + startMarkerLine.length;

	const patternEndMarker = new RegExp(`^${escapeRegExp(indent + end)}\\n`, 'm');
	result = patternEndMarker.exec(src.slice(contentPosition));
	if (result === null) {
		throw new Error(`end marker is not found: ${end}`);
	}

	const endMarkerLine = result[0] ?? '';
	const content = src.slice(contentPosition, contentPosition + result.index);
	const section = src.slice(sectionPosition, contentPosition + content.length + endMarkerLine.length);
	return {
		content,
		contentPosition,
		indent,
		section,
		sectionPosition
	};
}

export async function renderSection(src: string, options: SectionOptions, func: (section: Section) => Promise<string>): Promise<string> {
	const {position = 0} = options;
	let result = section(src, options);
	if (result.contentPosition < 0) {
		const section = [options.start, options.end, ''].join('\n');
		result = {
			...result,
			section,
			sectionPosition: position
		};
		const content = await func(result);
		return [
			src.slice(0, result.sectionPosition),
			`${options.start}\n`,
			content,
			`${options.end}\n`,
			src.slice(result.sectionPosition)
		].join('');
	}

	const content = await func(result);
	return [
		src.slice(0, result.contentPosition),
		content,
		src.slice(result.contentPosition + result.content.length)
	].join('');
}

