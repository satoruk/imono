import camelCase from 'lodash/camelCase';
import kebabCase from 'lodash/kebabCase';
import repeat from 'lodash/repeat';
import snakeCase from 'lodash/snakeCase';
import toLower from 'lodash/toLower';
import toUpper from 'lodash/toUpper';
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

export function toSnakeCase(value: string): string {
	return snakeCase(value);
}

export function toLowerCase(value: string): string {
	return toLower(value);
}

export function toUpperCase(value: string): string {
	return toUpper(value);
}

export function toUpperSnakeCase(value: string): string {
	return toUpper(snakeCase(value));
}

type IndentOptions = {
	indent?: string;
	depth?: number;
};
export function indent(value: string, options: IndentOptions = {}): string {
	const {indent = '  ', depth = 1} = options;
	const computedIndent = repeat(indent, depth);
	return value.split('\n').map(v => {
		if (v.length === 0) {
			return v;
		}

		return computedIndent + v;
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

export function toLines(v: string): string[] {
	const lines = v.split(/\r?\n/);
	const length = lines.length;
	if (length > 0 && lines[length - 1] === '') {
		return lines.slice(0, -1);
	}

	return lines;
}
