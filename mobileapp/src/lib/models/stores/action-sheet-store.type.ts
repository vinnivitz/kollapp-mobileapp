import type { Readable } from 'svelte/store';

/**
 * Store for managing action sheet open states in the application.
 */
export type ActionSheetStore = Readable<HTMLIonActionSheetElement[] | undefined> & {
	add: (actionSheet: HTMLIonActionSheetElement) => void;
	closeLastIfExists: () => boolean;
	remove: (actionSheet: HTMLIonActionSheetElement) => void;
};
