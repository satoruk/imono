
export function errorToString(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}
