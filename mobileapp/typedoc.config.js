/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
	entryPoints: [
		'./src/lib/utility',
		'./src/lib/models/api',
		'./src/lib/models/models',
		'./src/lib/models/storage',
		'./src/lib/models/stores',
		'./src/lib/models/ui',
		'./src/lib/models/osm',
		'./src/lib/stores',
		'./src/lib/locales',
		'./src/lib/api/services',
		'./src/lib/api/dto',
		'./src/lib/api/schema'
	],
	excludeNotDocumented: true,
	name: 'Kollapp Mobileapp',
	out: 'docs'
};

export default config;
