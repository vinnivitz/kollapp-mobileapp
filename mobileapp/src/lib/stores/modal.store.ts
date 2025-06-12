import type { ModalStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

function createStore(): ModalStore {
	const { subscribe, update } = writable<HTMLIonModalElement[]>([]);

	async function add(modal: HTMLIonModalElement): Promise<void> {
		return new Promise((resolve) => {
			update((modals) => {
				if (!modals.includes(modal)) {
					modals.push(modal);
				}
				resolve();
				return modals;
			});
		});
	}

	async function remove(modal: HTMLIonModalElement): Promise<void> {
		return new Promise((resolve) => {
			update((modals) => {
				const index = modals.indexOf(modal);
				if (index !== -1) {
					modals.splice(index, 1);
				}
				resolve();
				return modals;
			});
		});
	}

	async function closeLastIfExists(): Promise<boolean> {
		return new Promise((resolve) => {
			update((modals) => {
				const modal = modals.pop();
				if (modal) {
					modal.dismiss();
				}
				resolve(!!modal);
				return modals;
			});
		});
	}

	return {
		add,
		closeLastIfExists,
		remove,
		subscribe
	};
}

/**
 * Store for managing opened modals.
 */
export const modalStore = createStore();
