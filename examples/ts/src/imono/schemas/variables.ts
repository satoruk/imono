/* eslint @typescript-eslint/consistent-indexed-object-style: "off" */

/** Variable configuration */
export interface ConfigVariables {
	models: {[name: string]: Model};
}

export function normalizate(value: ConfigVariables): ConfigVariables {
	return value;
}

/** Model */
export interface Model {
	attributes: {[name: string]: ModelAttribute};
	base?: string;
	desc: string;
}

/** Model's attribute */
export interface ModelAttribute {
	desc: string;
	optional: boolean;
	type: string;
}
