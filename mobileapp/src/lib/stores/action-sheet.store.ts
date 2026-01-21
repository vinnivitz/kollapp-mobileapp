import type { ActionSheetStore } from '$lib/models/stores';

import { writable } from 'svelte/store';

function createStore(): ActionSheetStore {
	const { subscribe, update } = writable<HTMLIonActionSheetElement[]>([]);

	function add(actionSheet: HTMLIonActionSheetElement): void {
		update((actionSheets) => {
			if (!actionSheets.includes(actionSheet)) {
				actionSheets.push(actionSheet);
			}
			return actionSheets;
		});

		actionSheet.addEventListener('didDismiss', () => remove(actionSheet), { once: true });
	}

	function remove(actionSheet: HTMLIonActionSheetElement): void {
		update((actionSheets) => {
			const index = actionSheets.indexOf(actionSheet);
			if (index !== -1) {
				actionSheets.splice(index, 1);
			}
			return actionSheets;
		});
	}

	function closeLastIfExists(): boolean {
		let closed = false;
		update((actionSheets) => {
			const actionSheet = actionSheets.pop();
			if (actionSheet) {
				actionSheet.dismiss();
				closed = true;
			}
			return actionSheets;
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
 * Store for managing opened action sheets.
 */
export const actionSheetStore = createStore();
