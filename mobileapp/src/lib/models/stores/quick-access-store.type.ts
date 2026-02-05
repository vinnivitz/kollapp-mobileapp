import type { QuickAccessItemModel } from '$lib/models/ui';

/**
 * Map of organization ID to quick access items
 */
export type QuickAccessStoreItem = {
	editMode: boolean;
	initialized: boolean;
	items: QuickAccessItemModel[];
	itemsMap: QuickAccessItemsMap;
};

/**
 * Map of organization ID to quick access items
 */
export type QuickAccessItemsMap = Record<number, QuickAccessItemModel[]>;
