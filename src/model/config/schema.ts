/* eslint @typescript-eslint/consistent-indexed-object-style: "off" */

/** Imono's config */
export interface Config {
	/** Your project base directory */
	base?: string;
	plan: {[name: string]: Plan};
	/** Variable settings */
	variable: Variable;
}

/**	Variable settings */
export interface Variable {
	/**	Configuration file path */
	config: string;
	/**	Configuration schema file path */
	schema: string;
	/**	Implement typescript file path */
	source: string;
}

export interface Plan {
	actions: Action[];
	name: string;
}

export interface Action {
	key?: string;
	name: string;
	path: string;
	type: string;
}
