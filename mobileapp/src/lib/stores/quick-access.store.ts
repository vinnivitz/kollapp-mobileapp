import type { QuickAccessItemsMap, QuickAccessStoreItem } from '$lib/models/stores';
import type { QuickAccessItem } from '$lib/models/ui';

import { get, writable } from 'svelte/store';

import { organizationStore } from './organization.store';

import { t } from '$lib/locales';
import { StorageKey } from '$lib/models/storage';
import { getOrganizationId, getStoredValue, hasOrganizationRole, storeValue } from '$lib/utility';

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

type QuickAccessStoreType = {
	addItem: (item: QuickAccessItem) => Promise<void>;
	getItems: () => QuickAccessItem[];
	initialize: () => Promise<void>;
	removeItem: (id: string) => Promise<void>;
	reorderItems: (items: QuickAccessItem[]) => Promise<void>;
	setEditMode: (enabled: boolean) => void;
	subscribe: (run: (value: QuickAccessStoreItem) => void) => () => void;
};

function filterByAccess(items: QuickAccessItem[]): QuickAccessItem[] {
	const isManager = hasOrganizationRole('ROLE_ORGANIZATION_MANAGER');
	return items.filter((item) => !item.accessible || isManager || hasOrganizationRole(item.accessible));
}

function createStore(): QuickAccessStoreType {
	const { subscribe, update } = writable<QuickAccessStoreItem>({
		editMode: false,
		items: [],
		itemsMap: {}
	});

	function updateCurrentItems(state: QuickAccessStoreItem): QuickAccessStoreItem {
		const organizationId = getOrganizationId();
		if (!organizationId) {
			return { ...state, items: [] };
		}
		const organizationItems = state.itemsMap[organizationId] ?? [];
		return { ...state, items: filterByAccess(organizationItems) };
	}

	async function initialize(): Promise<void> {
		const stored = await getStoredValue<QuickAccessItemsMap>(StorageKey.QUICK_ACCESS);
		const organizationId = getOrganizationId();

		if (stored) {
			update((state) => {
				const newState = { ...state, itemsMap: stored };
				return updateCurrentItems(newState);
			});
		} else {
			const defaultItems = SPECIAL_WIDGETS();
			const itemsMap: QuickAccessItemsMap = {};
			if (organizationId !== undefined) {
				itemsMap[organizationId] = defaultItems;
			}
			update((state) => {
				const newState = { ...state, itemsMap };
				return updateCurrentItems(newState);
			});
			await storeValue(StorageKey.QUICK_ACCESS, itemsMap);
		}
	}

	async function addItem(item: QuickAccessItem): Promise<void> {
		const orgId = getOrganizationId();
		if (orgId === undefined) return;

		update((state) => {
			const currentOrganizationItems = state.itemsMap[orgId] ?? [];
			const exists = currentOrganizationItems.some((index) => index.id === item.id);
			if (exists) return state;

			const newOrganizationItems = [...currentOrganizationItems, item];
			const newItemsMap = { ...state.itemsMap, [orgId]: newOrganizationItems };
			storeValue(StorageKey.QUICK_ACCESS, newItemsMap);
			return updateCurrentItems({ ...state, itemsMap: newItemsMap });
		});
	}

	async function removeItem(id: string): Promise<void> {
		const organizationId = getOrganizationId();
		if (!organizationId) return;

		update((state) => {
			const currentOrganizationItems = state.itemsMap[organizationId] ?? [];
			const newOrganizationItems = currentOrganizationItems.filter((item) => item.id !== id);
			const newItemsMap = { ...state.itemsMap, [organizationId]: newOrganizationItems };
			storeValue(StorageKey.QUICK_ACCESS, newItemsMap);
			return updateCurrentItems({ ...state, itemsMap: newItemsMap });
		});
	}

	async function reorderItems(items: QuickAccessItem[]): Promise<void> {
		const organizationId = getOrganizationId();
		if (!organizationId) return;

		update((state) => {
			const newItemsMap = { ...state.itemsMap, [organizationId]: items };
			storeValue(StorageKey.QUICK_ACCESS, newItemsMap);
			return updateCurrentItems({ ...state, itemsMap: newItemsMap });
		});
	}

	function setEditMode(enabled: boolean): void {
		update((state) => ({ ...state, editMode: enabled }));
	}

	function getItems(): QuickAccessItem[] {
		return get({ subscribe }).items;
	}

	organizationStore.subscribe((organization) => {
		if (organization) {
			update((state) => {
				if (!state.itemsMap[organization.id]) {
					const defaultItems = SPECIAL_WIDGETS();
					const newItemsMap = { ...state.itemsMap, [organization.id]: defaultItems };
					storeValue(StorageKey.QUICK_ACCESS, newItemsMap);
					return updateCurrentItems({ ...state, itemsMap: newItemsMap });
				}
				return updateCurrentItems(state);
			});
		}
	});

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
