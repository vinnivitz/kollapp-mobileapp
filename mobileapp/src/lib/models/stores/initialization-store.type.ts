import type { InitializationModel } from '$lib/models/models';
import type { Readable } from 'svelte/store';

/**
 * Store for initialization state of the application.
 */
export type InitializationStore = InitializationModel & { loaded: Readable<boolean> };
