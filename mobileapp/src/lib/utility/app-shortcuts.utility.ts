import type { QuickAccessItemModel } from '$lib/models/ui';

import { AppShortcuts, type Shortcut } from '@capawesome/capacitor-app-shortcuts';

import { dev } from '$app/environment';
import { goto } from '$app/navigation';

import { triggerClickByLabel } from '$lib/utility';

/**
 * Maximum number of app shortcuts that can be set.
 * iOS allows max 4, Android allows more but we keep it consistent.
 */
const MAX_SHORTCUTS = 4;

/**
 * Maps ionicons icon names to iOS SF Symbols and Android drawable resources.
 * @see https://developer.apple.com/sf-symbols/
 * @see https://developer.android.com/reference/android/R.drawable
 */
const ICON_MAP: Record<string, { android: string; ios: string }> = {
	addOutline: { android: 'ic_menu_add', ios: 'plus' },
	calendarOutline: { android: 'ic_menu_my_calendar', ios: 'calendar' },
	cardOutline: { android: 'ic_menu_sort_by_size', ios: 'creditcard' },
	cashOutline: { android: 'ic_menu_sort_by_size', ios: 'banknote' },
	createOutline: { android: 'ic_menu_edit', ios: 'square.and.pencil' },
	flashOutline: { android: 'ic_menu_agenda', ios: 'bolt' },
	homeOutline: { android: 'ic_menu_compass', ios: 'house' },
	listOutline: { android: 'ic_menu_sort_alphabetically', ios: 'list.bullet' },
	locationOutline: { android: 'ic_menu_mapmode', ios: 'location' },
	peopleOutline: { android: 'ic_menu_allfriends', ios: 'person.2' },
	personOutline: { android: 'ic_menu_cc', ios: 'person' },
	settingsOutline: { android: 'ic_menu_preferences', ios: 'gearshape' },
	statsChartOutline: { android: 'ic_menu_info_details', ios: 'chart.bar' },
	trendingDownOutline: { android: 'ic_menu_recent_history', ios: 'arrow.down.right' },
	trendingUpOutline: { android: 'ic_menu_recent_history', ios: 'arrow.up.right' }
};

/**
 * Converts a QuickAccessItem to an AppShortcut.
 * @param item The quick access item to convert.
 * @returns A shortcut object for the App Shortcuts plugin.
 */
function toShortcut(item: QuickAccessItemModel): Shortcut {
	const iconMapping = ICON_MAP[item.icon] ?? { android: 'ic_menu_agenda', ios: 'bolt' };

	return {
		androidIcon: iconMapping.android,
		description: item.label,
		id: item.id,
		iosIcon: iconMapping.ios,
		title: item.label
	};
}

/**
 * Initializes app shortcuts from the current quick access items.
 * Should be called after quick access store is initialized and when items change.
 * @param items The current quick access items from the store.
 */
export async function syncAppShortcuts(items: QuickAccessItemModel[]): Promise<void> {
	if (dev) return;

	try {
		const normalItems = items.filter((item) => item.widgetType === 'normal');

		const shortcutItems = normalItems.slice(0, MAX_SHORTCUTS);

		if (shortcutItems.length === 0) {
			const allItems = items.slice(0, MAX_SHORTCUTS);
			const shortcuts = allItems.map((item) => toShortcut(item));

			await AppShortcuts.set({ shortcuts });
		} else {
			const shortcuts = shortcutItems.map((item) => toShortcut(item));
			await AppShortcuts.set({ shortcuts });
		}
	} catch (error) {
		if (dev) console.error('[AppShortcuts] Failed to sync shortcuts:', error);
	}
}

/**
 * Clears all app shortcuts.
 */
export async function clearAppShortcuts(): Promise<void> {
	if (dev) return;

	try {
		await AppShortcuts.clear();
	} catch (error) {
		if (dev) console.error('[AppShortcuts] Failed to clear shortcuts:', error);
	}
}

/**
 * Handles a shortcut click event by navigating to the corresponding route.
 * @param shortcutId The ID of the clicked shortcut.
 * @param items The current quick access items to find the route.
 */
async function handleShortcutClick(shortcutId: string, items: QuickAccessItemModel[]): Promise<void> {
	const item = items.find((index) => index.id === shortcutId);

	if (!item) {
		if (dev) console.warn('[AppShortcuts] No item found for shortcut:', shortcutId);
		return;
	}

	try {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(item.route);
		await triggerClickByLabel(item.label);
	} catch (error) {
		if (dev) console.error('[AppShortcuts] Navigation failed:', error);
	}
}

/**
 * Initializes the app shortcuts listener.
 * Should be called once when the app starts.
 * @param getItems A function that returns the current quick access items.
 */
export async function initAppShortcutsListener(getItems: () => QuickAccessItemModel[]): Promise<void> {
	if (dev) return;

	try {
		await AppShortcuts.removeAllListeners();

		await AppShortcuts.addListener('click', (event) => {
			handleShortcutClick(event.shortcutId, getItems());
		});
	} catch (error) {
		if (dev) console.error('[AppShortcuts] Failed to initialize listener:', error);
	}
}

/**
 * Full initialization: sets up listener and syncs shortcuts from quick access items.
 * @param getItems A function that returns the current quick access items.
 */
export async function initAppShortcuts(getItems: () => QuickAccessItemModel[]): Promise<void> {
	await initAppShortcutsListener(getItems);
	await syncAppShortcuts(getItems());
}
