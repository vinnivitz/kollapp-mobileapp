import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import { writable } from 'svelte/store';

import { DateTimePickerType, type GlobalPopover } from '$lib/models/ui';

export const globalPopoverStore: GlobalPopover = {
	datetimeInputItem: writable({ open: false, type: DateTimePickerType.DATE, value: format(new TZDate(), 'yyyy-MM-dd') })
};
