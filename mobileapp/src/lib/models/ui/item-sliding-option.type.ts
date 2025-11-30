import type { Colors } from '$lib/models/ui';

/**
 * Represents an option for an item sliding action in Ionic.
 */
export type ItemSlidingOption = {
	icon: string;
	color?: Colors;
	handler: () => void;
};
