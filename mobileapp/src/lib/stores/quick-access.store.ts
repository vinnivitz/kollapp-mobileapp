import type { QuickAccessItem } from '$lib/models/ui';

import { get, writable } from 'svelte/store';

import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { getStoredValue, storeValue } from '$lib/utility';

/**
 * Available special widgets that can be added to quick access
 */
export const SPECIAL_WIDGETS = (): QuickAccessItem[] => {
	const $t = get(t);
	return [
		{
			icon: 'peopleOutline',
			id: 'organization-card',
			label: $t('stores.quick-access.special-widgets.organization-card'),
			route: '/organization',
			specialWidgetId: 'organization-card',
			widgetType: 'special'
		},
		{
			icon: 'calendarOutline',
			id: 'upcoming-activity-card',
			label: $t('stores.quick-access.special-widgets.upcoming-activity-card'),
			route: '/organization/activities/[slug]',
			specialWidgetId: 'upcoming-activity-card',
			widgetType: 'special'
		},
		{
			icon: 'cashOutline',
			id: 'budget-chart-card',
			label: $t('stores.quick-access.special-widgets.budget-chart-card'),
			route: '/organization',
			specialWidgetId: 'budget-chart-card',
			widgetType: 'special'
		}
	] satisfies QuickAccessItem[];
};

export type QuickAccessStore = {
	editMode: boolean;
	items: QuickAccessItem[];
};

type QuickAccessStoreType = {
	addItem: (item: QuickAccessItem) => Promise<void>;
	getItems: () => QuickAccessItem[];
	initialize: () => Promise<void>;
	removeItem: (id: string) => Promise<void>;
	reorderItems: (items: QuickAccessItem[]) => Promise<void>;
	setEditMode: (enabled: boolean) => void;
	subscribe: (run: (value: QuickAccessStore) => void) => () => void;
};

function createStore(): QuickAccessStoreType {
	const { subscribe, update } = writable<QuickAccessStore>({
		editMode: false,
		items: []
	});

	async function initialize(): Promise<void> {
		const stored = await getStoredValue<QuickAccessItem[]>(StorageKey.QUICK_ACCESS);
		if (stored) {
			update((state) => ({ ...state, items: stored }));
		} else {
			update((state) => ({ ...state, items: SPECIAL_WIDGETS() }));
			await storeValue(StorageKey.QUICK_ACCESS, SPECIAL_WIDGETS());
		}
	}

	async function addItem(item: QuickAccessItem): Promise<void> {
		update((state) => {
			const exists = state.items.some((index) => index.id === item.id);
			if (exists) return state;
			const newItems = [...state.items, item];
			storeValue(StorageKey.QUICK_ACCESS, newItems);
			return { ...state, items: newItems };
		});
	}

	async function removeItem(id: string): Promise<void> {
		update((state) => {
			const newItems = state.items.filter((item) => item.id !== id);
			storeValue(StorageKey.QUICK_ACCESS, newItems);
			return { ...state, items: newItems };
		});
	}

	async function reorderItems(items: QuickAccessItem[]): Promise<void> {
		update((state) => {
			storeValue(StorageKey.QUICK_ACCESS, items);
			return { ...state, items };
		});
	}

	function setEditMode(enabled: boolean): void {
		update((state) => ({ ...state, editMode: enabled }));
	}

	function getItems(): QuickAccessItem[] {
		return get({ subscribe }).items;
	}

	return {
		addItem,
		getItems,
		initialize,
		removeItem,
		reorderItems,
		setEditMode,
		subscribe
	};
}

/**
 * Store for quick access items on home screen
 */
export const quickAccessStore = createStore();
