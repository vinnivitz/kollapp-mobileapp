import type { RouteId } from '$app/types';

/**
 * Type of quick access widget
 */
export type QuickAccessWidgetType = 'normal' | 'special';

/**
 * Special widget identifiers for large widgets like cards
 */
export type SpecialWidgetId = 'budget-chart-card' | 'organization-card' | 'upcoming-activity-card';

/**
 * Represents a quick access item on the home screen.
 */
export type QuickAccessItem = {
	/** Icon name from ionicons */
	icon: string;
	/** Unique identifier for the item */
	id: string;
	/** Route to navigate to */
	route: RouteId;
	/** Translation key for the label (optional for special widgets) */
	label?: string;
	/** Special widget identifier for rendering the correct component */
	specialWidgetId?: SpecialWidgetId;
	/** Optional label to trigger a click action after navigation */
	triggerLabel?: string;
	/** Widget type - normal (small) or special (large card) */
	widgetType?: QuickAccessWidgetType;
};
