import type { Readable } from 'svelte/store';

export type InitializationModel = {
	loadedCache: Readable<boolean>;
	loadedServer: Readable<boolean>;
};
