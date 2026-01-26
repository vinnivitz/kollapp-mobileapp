import type { Colors } from '$lib/models/ui';

/**
 * Represents a select item schema with a selected state and a value.
 */
export type MultiSelectItem = {
	data: MultiSelectItemData;
	selected: boolean;
	color?: Colors;
	icon?: string;
};

/**
 * Represents the data of a select item.
 */
export type MultiSelectItemData = {
	id: number;
	label: string;
};
