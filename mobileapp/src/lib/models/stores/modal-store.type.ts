import type { Readable } from 'svelte/store';

export type ModalStore = Readable<HTMLIonModalElement[] | undefined> & {
	add: (modal: HTMLIonModalElement) => Promise<void>;
	closeLastIfExists: () => Promise<boolean>;
	remove: (modal: HTMLIonModalElement) => Promise<void>;
};
