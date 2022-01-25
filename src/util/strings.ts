import camelCase from 'lodash/camelCase';
import kebabCase from 'lodash/kebabCase';
import repeat from 'lodash/repeat';
import upperFirst from 'lodash/upperFirst';

export function toUpperCamelCase(value: string): string {
	return upperFirst(camelCase(value));
}

export function toLowerCamelCase(value: string): string {
	return camelCase(value);
}

export function toKebabCase(value: string): string {
	return kebabCase(value);
}

type IndentOptions = {
	indent?: string;
	depth?: number;
};
export function indent(value: string, options: IndentOptions = {}): string {
	const {indent = '  ', depth = 1} = options;
	return value.split('\n').map(v => {
		if (v.length === 0) {
			return v;
		}

		return repeat(indent, depth) + v;
	}).join('\n');
}

type WrapOptions = {
	prefix?: string;
	suffix?: number;
	after?: (v: string) => string;
};
export function wrap(value: string, options: WrapOptions = {}): string {
	const {prefix = '', suffix = '', after = v => v} = options;
	return value.split('\n').map(v => after(`${prefix}${v}${suffix}`)).join('\n');
}
