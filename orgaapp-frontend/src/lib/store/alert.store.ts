import { writable } from 'svelte/store';

import type { AlertModel } from '$lib/models';

export const alertStore = writable<AlertModel>();
