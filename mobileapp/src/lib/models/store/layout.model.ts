import type { BaseStore } from '$lib/models/store';

/**
 * List of available layouts.
 */
export enum Layout {
	CLASSIC = 'classic',
	MODERN = 'modern',
	PLAYFUL = 'playful'
}

/**
 * Store for the layout.
 */
export type LayoutStore = BaseStore<Layout>;
