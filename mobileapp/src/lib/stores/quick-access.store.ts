import type { QuickAccessItem } from '$lib/models/ui';

import { get, writable } from 'svelte/store';

import { StorageKey } from '$lib/models/storage';
import { getStoredValue, storeValue } from '$lib/utility';

/**
 * Available special widgets that can be added to quick access
 */
export const AVAILABLE_SPECIAL_WIDGETS: QuickAccessItem[] = [
	{
		icon: 'peopleOutline',
		id: 'special-organization-card',
		route: '/organization',
		specialWidgetId: 'organization-card',
		widgetType: 'special'
	},
	{
		icon: 'calendarOutline',
		id: 'special-upcoming-activity-card',
		route: '/organization/activities/[slug]',
		specialWidgetId: 'upcoming-activity-card',
		widgetType: 'special'
	},
	{
		icon: 'cashOutline',
		id: 'special-budget-chart-card',
		route: '/organization',
		specialWidgetId: 'budget-chart-card',
		widgetType: 'special'
	}
];

/**
 * Default quick access items for managers
 */
const DEFAULT_MANAGER_ITEMS: QuickAccessItem[] = [
	{
		icon: 'peopleOutline',
		id: 'special-organization-card',
		route: '/organization',
		specialWidgetId: 'organization-card',
		widgetType: 'special'
	},
	{
		icon: 'calendarOutline',
		id: 'special-upcoming-activity-card',
		route: '/organization/activities/[slug]',
		specialWidgetId: 'upcoming-activity-card',
		widgetType: 'special'
	},
	{
		icon: 'cashOutline',
		id: 'special-budget-chart-card',
		route: '/organization',
		specialWidgetId: 'budget-chart-card',
		widgetType: 'special'
	}
];

/**
 * Default quick access items for non-managers
 */
const DEFAULT_MEMBER_ITEMS: QuickAccessItem[] = [
	{
		icon: 'peopleOutline',
		id: 'special-organization-card',
		route: '/organization',
		specialWidgetId: 'organization-card',
		widgetType: 'special'
	},
	{
		icon: 'calendarOutline',
		id: 'special-upcoming-activity-card',
		route: '/organization/activities/[slug]',
		specialWidgetId: 'upcoming-activity-card',
		widgetType: 'special'
	},
	{
		icon: 'cashOutline',
		id: 'special-budget-chart-card',
		route: '/organization',
		specialWidgetId: 'budget-chart-card',
		widgetType: 'special'
	}
];

export type QuickAccessStore = {
	editMode: boolean;
	items: QuickAccessItem[];
};

type QuickAccessStoreType = {
	addItem: (item: QuickAccessItem) => Promise<void>;
	getItems: () => QuickAccessItem[];
	initialize: (isManager: boolean) => Promise<void>;
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

	async function initialize(isManager: boolean): Promise<void> {
		const stored = await getStoredValue<QuickAccessItem[]>(StorageKey.QUICK_ACCESS);
		if (stored) {
			update((state) => ({ ...state, items: stored }));
		} else {
			const defaultItems = isManager ? DEFAULT_MANAGER_ITEMS : DEFAULT_MEMBER_ITEMS;
			update((state) => ({ ...state, items: defaultItems }));
			await storeValue(StorageKey.QUICK_ACCESS, defaultItems);
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
