
export interface CLIOptions {
	// We use this to access the inference flags
	[option: string]: any;

	base: string;
}

export async function main(args: string[] | Partial<CLIOptions>) {
	console.log(args);
}

if (require.main === module) {
	main(process.argv.slice(2)).catch(error => {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}.`);
		} else {
			console.error(error);
		}

		process.exitCode = 1;
	});
}
