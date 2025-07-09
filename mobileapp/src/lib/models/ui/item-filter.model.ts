/**
 * Represents a item filter schema with a selected state and a value.
 */
export type FilterItem<T = string> = {
	data: T;
	selected: boolean;
};
