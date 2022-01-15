import Ajv, {JSONSchemaType} from 'ajv';

export function asserts<T>(data: unknown, schema: unknown): asserts data is T {
	const ajv = new Ajv();

	const validate = ajv.compile(schema as JSONSchemaType<T>);
	const valid = validate(data);
	if (!valid) {
		console.error(validate.errors);
		throw new TypeError('Invalid config file');
	}
}
