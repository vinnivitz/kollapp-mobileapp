/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
	entryPoints: [
		'./src/lib/utility',
		'./src/lib/models/api',
		'./src/lib/models/models',
		'./src/lib/models/preferences',
		'./src/lib/models/routing',
		'./src/lib/models/stores',
		'./src/lib/models/ui',
		'./src/lib/models/osm',
		'./src/lib/stores',
		'./src/lib/locales',
		'./src/lib/api/resources',
		'./src/lib/api/dto/client/accounting',
		'./src/lib/api/dto/client/auth',
		'./src/lib/api/dto/client/organization',
		'./src/lib/api/dto/client/user',
		'./src/lib/api/dto/server',
		'./src/lib/api/dto/server/accounting',
		'./src/lib/api/dto/server/auth',
		'./src/lib/api/dto/server/organization',
		'./src/lib/api/dto/server/nominatim',
		'./src/lib/api/dto/server/searchables'
	],
	excludeNotDocumented: true,
	name: 'Kollapp Mobileapp',
	out: 'docs'
};

export default config;
