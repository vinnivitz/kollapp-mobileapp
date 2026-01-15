import type { Colors } from '$lib/models/ui';

/**
 * Represents a select item schema with a selected state and a value.
 */
export type SelectItem = {
	data: SelectItemData;
	selected: boolean;
	color?: Colors;
	icon?: string;
};

/**
 * Represents the data of a select item.
 */
export type SelectItemData = {
	id: number;
	label: string;
};
