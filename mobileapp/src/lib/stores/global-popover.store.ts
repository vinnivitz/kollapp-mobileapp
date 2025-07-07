import type { GlobalPopoverModal } from '$lib/models/models';

import { writable } from 'svelte/store';

export const globalPopoverStore: GlobalPopoverModal = {
	datetimeInputItem: writable({ includeDate: true, includeTime: false, open: false, value: new Date().toISOString() })
};
