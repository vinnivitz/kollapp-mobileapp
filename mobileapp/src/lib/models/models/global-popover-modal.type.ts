import type { Writable } from 'svelte/store';

export type GlobalPopoverModal = {
	datetimeInputItem: Writable<{
		includeDate?: boolean;
		includeTime?: boolean;
		max?: string;
		min?: string;
		open?: boolean;
		value?: string;
		applied?: (value: string) => void;
		dismissed?: () => void;
	}>;
};
