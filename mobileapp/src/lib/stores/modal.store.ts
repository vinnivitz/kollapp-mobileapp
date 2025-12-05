import type { ModalStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

function createStore(): ModalStore {
	const { subscribe, update } = writable<HTMLIonModalElement[]>([]);

	function add(modal: HTMLIonModalElement): void {
		update((modals) => {
			if (!modals.includes(modal)) {
				modals.push(modal);
			}
			return modals;
		});

		modal.addEventListener('didDismiss', () => remove(modal), { once: true });
	}

	function remove(modal: HTMLIonModalElement): void {
		update((modals) => {
			const index = modals.indexOf(modal);
			if (index !== -1) {
				modals.splice(index, 1);
			}
			return modals;
		});
	}

	function closeLastIfExists(): boolean {
		let closed = false;
		update((modals) => {
			const modal = modals.pop();
			if (modal) {
				modal.dismiss();
				closed = true;
			}
			return modals;
		});
		return closed;
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
