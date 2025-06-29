import type { Readable } from 'svelte/store';

/**
 * Store for managing modal open states in the application.
 */
export type ModalStore = Readable<HTMLIonModalElement[] | undefined> & {
	add: (modal: HTMLIonModalElement) => Promise<void>;
	closeLastIfExists: () => Promise<boolean>;
	remove: (modal: HTMLIonModalElement) => Promise<void>;
};
