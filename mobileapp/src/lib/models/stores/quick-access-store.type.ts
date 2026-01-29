import type { QuickAccessItem } from '$lib/models/ui';

/**
 * Map of organization ID to quick access items
 */
export type QuickAccessStoreItem = {
	editMode: boolean;
	initialized: boolean;
	items: QuickAccessItem[];
	itemsMap: QuickAccessItemsMap;
};

/**
 * Map of organization ID to quick access items
 */
export type QuickAccessItemsMap = Record<number, QuickAccessItem[]>;
