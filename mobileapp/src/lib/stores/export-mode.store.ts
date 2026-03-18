import { writable } from 'svelte/store';

/**
 * Store to track if the app is in export mode.
 * When true, lazy-rendered components will render immediately.
 */
export const exportModeStore = writable<boolean>(false);
