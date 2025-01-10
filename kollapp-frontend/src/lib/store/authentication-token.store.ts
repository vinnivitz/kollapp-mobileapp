import { writable } from 'svelte/store';

export const authenticationTokenStore = writable<string | undefined>();
