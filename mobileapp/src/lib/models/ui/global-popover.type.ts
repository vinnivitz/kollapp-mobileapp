import type { DateTimePickerType } from './datetime.type';
import type { Writable } from 'svelte/store';

export type GlobalPopover = {
	datetimeInputItem: Writable<{
		type: DateTimePickerType;
		max?: string;
		min?: string;
		open?: boolean;
		value?: string;
		applied?: (value: string) => void;
		dismissed?: () => void;
	}>;
};
