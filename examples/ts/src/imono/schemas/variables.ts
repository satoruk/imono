/* eslint @typescript-eslint/consistent-indexed-object-style: "off" */

/** Variable configuration */
export interface Variables {
	models: {[name: string]: Model};
}

/** Model */
export interface Model {
	attributes: {[name: string]: ModelAttribute | string};
	base?: string;
	desc?: string;
}

/** Model's attribute */
export interface ModelAttribute {
	desc?: string;
	optional?: boolean;
	type: string;
}
