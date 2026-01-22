import type { Colors, SelectItem } from '$lib/models/ui';

/**
 * Configuration for a chip option in a filter section.
 */
export type FilterChipOption<T extends string = string> = {
	/** Display label for the chip */
	label: string;
	/** Unique value identifier for this chip */
	value: T;
	/** Optional color for the chip */
	color?: Colors;
	/** Optional icon for the chip */
	icon?: string;
};

/**
 * A section with chip options for single selection.
 */
export type FilterChipSection<T extends string = string> = FilterSectionBase & {
	/** Default/initial value */
	defaultValue: T;
	/** Available chip options */
	options: FilterChipOption<T>[];
	type: 'chips';
};

/**
 * A section with chip options for multiple selection (toggle behavior).
 */
export type FilterChipMultiSection<T extends string = string> = FilterSectionBase & {
	/** Default/initial values */
	defaultValue: T[];
	/** Available chip options */
	options: FilterChipOption<T>[];
	type: 'chips-multi';
};

/**
 * A section with a datetime range picker.
 */
export type FilterDateRangeSection = FilterSectionBase & {
	/** Default from date value */
	defaultFromValue: string;
	/** Default to date value */
	defaultToValue: string;
	type: 'date-range';
	/** Label for the from date input */
	fromLabel?: string;
	/** Maximum selectable date */
	max?: string;
	/** Minimum selectable date */
	min?: string;
	/** Label for the to date input */
	toLabel?: string;
};

/**
 * A section with a multi-select dropdown.
 */
export type FilterMultiSelectSection = FilterSectionBase & {
	/** Default selected IDs */
	defaultValue: number[];
	/** Icon for the multi-select */
	icon: string;
	/** Label for the multi-select input */
	inputLabel: string;
	/** Items available for selection */
	items: SelectItem[];
	type: 'multi-select';
	/** Text shown when all items are selected */
	allSelectedText?: string;
	/** Text shown when no items are selected */
	noneSelectedText?: string;
	/** Placeholder for search input */
	searchPlaceholder?: string;
};

/**
 * Union type for all possible filter section types.
 */
export type FilterSection =
	| FilterChipMultiSection
	| FilterChipSection
	| FilterDateRangeSection
	| FilterMultiSelectSection;

/**
 * Filter state object - maps section keys to their values.
 */
export type FilterState<T extends Record<string, unknown> = Record<string, unknown>> = T;

/**
 * Searchbar configuration for the filter.
 */
export type FilterSearchbarConfig = {
	/** Placeholder text for the searchbar */
	placeholder?: string;
	/** Callback when search value changes */
	onSearch: (value: string) => void;
};

/**
 * Complete filter configuration.
 */
export type FilterConfig<TState extends Record<string, unknown> = Record<string, unknown>> = {
	/** Filter sections to display */
	sections: FilterSection[];
	/** Current filter state (applied values) */
	state: TState;
	/** Title of the filter popover */
	title: string;
	/** Label for the apply button in the popover */
	applyLabel?: string;
	/** Label for the inline reset button (shown when filters are applied) */
	resetFiltersLabel?: string;
	/** Label for the reset button in the popover */
	resetLabel?: string;
	/** Searchbar configuration - if provided, shows searchbar */
	searchbar?: FilterSearchbarConfig;
	/** Callback when filters are applied - receives the new state */
	onApply: (state: TState) => void;
	/** Callback when filters are reset */
	onReset?: () => void;
};

/**
 * Helper function to create a type-safe chip section.
 */
export function chipSection<T extends string>(
	key: string,
	config: Omit<FilterChipSection<T>, 'key' | 'type'>
): FilterChipSection<T> {
	return { ...config, key, type: 'chips' };
}

/**
 * Helper function to create a type-safe multi-chip section.
 */
export function chipMultiSection<T extends string>(
	key: string,
	config: Omit<FilterChipMultiSection<T>, 'key' | 'type'>
): FilterChipMultiSection<T> {
	return { ...config, key, type: 'chips-multi' };
}

/**
 * Helper function to create a date-range section.
 */
export function dateRangeSection(
	key: string,
	config: Omit<FilterDateRangeSection, 'key' | 'type'>
): FilterDateRangeSection {
	return { ...config, key, type: 'date-range' };
}

/**
 * Helper function to create a multi-select section.
 */
export function multiSelectSection(
	key: string,
	config: Omit<FilterMultiSelectSection, 'key' | 'type'>
): FilterMultiSelectSection {
	return { ...config, key, type: 'multi-select' };
}

/**
 * Base properties shared by all filter sections.
 */
type FilterSectionBase = {
	/** Unique key to identify this section in the filter state */
	key: string;
	/** Label displayed above the section */
	label: string;
};
