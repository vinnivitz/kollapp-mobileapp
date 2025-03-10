/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
	entryPoints: [
		'./src/lib/utils',
		'./src/lib/models/api',
		'./src/lib/models/models',
		'./src/lib/models/preferences',
		'./src/lib/models/routing',
		'./src/lib/models/stores',
		'./src/lib/models/ui',
		'./src/lib/store',
		'./src/lib/api/resources',
		'./src/lib/api/dto'
	],
	excludeNotDocumented: true,
	out: 'docs',
	name: 'Kollapp Client Documentation'
};

export default config;
