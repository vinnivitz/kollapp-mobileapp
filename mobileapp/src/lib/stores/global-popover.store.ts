import type { GlobalPopover } from '$lib/models/ui';

import { writable } from 'svelte/store';

export const globalPopoverStore: GlobalPopover = {
	datetimeInputItem: writable({ includeDate: true, includeTime: false, open: false, value: new Date().toISOString() })
};
