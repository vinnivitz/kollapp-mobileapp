import type { InitializationModel } from '$lib/models/models';
import type { Readable } from 'svelte/store';

export type InitializationStore = Readable<InitializationModel>;
