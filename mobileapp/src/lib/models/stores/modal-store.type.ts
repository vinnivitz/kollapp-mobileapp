import type { Readable } from 'svelte/store';

/**
 * Store for managing modal open states in the application.
 */
export type ModalStore = Readable<HTMLIonModalElement[] | undefined> & {
	add: (modal: HTMLIonModalElement) => void;
	closeLastIfExists: () => boolean;
	remove: (modal: HTMLIonModalElement) => void;
};
