/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
	entryPoints: [
		'./src/lib/utils',
		'./src/lib/models/preferences',
		'./src/lib/models/routing',
		'./src/lib/models/store',
		'./src/lib/models/ui',
		'./src/lib/store',
		'./src/lib/api/resources',
		'./src/lib/api/dto',
		'./src/lib/api/models',
		'./src/lib/api/utils'
	],
	excludeNotDocumented: true,
	out: 'docs',
	name: 'Kollapp Client Documentation'
};

export default config;
