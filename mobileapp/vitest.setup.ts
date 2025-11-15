// eslint-disable unicorn/consistent-function-scoping

import { Writable } from 'svelte/store';
import { vi } from 'vitest';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$app/environment', () => ({
	dev: false
}));

vi.mock('svelte/store', () => ({
	derived: () => ({
		subscribe: () => {}
	}),
	get: () => {},
	readable: () => ({
		subscribe: () => {}
	}),
	writable: () => ({
		set: () => {},
		subscribe: () => {}
	})
}));

vi.mock('$lib/locales', () => ({
	locale: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return () => {};
		}
	},
	t: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return () => {};
		}
	}
}));

vi.mock('$lib/stores', () => ({
	globalPopoverStore: {
		subscribe: (
			run: (v: {
				datetimeInputItem: {
					set: (
						value: Writable<{
							open: boolean;
							type: string;
							value: string | undefined;
							applied: (value: string) => void;
						}>
					) => void;
				};
			}) => void
		) => {
			run({
				datetimeInputItem: {
					set: vi.fn()
				}
			});
			return () => {};
		}
	},
	localeStore: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return () => {};
		}
	},
	modalStore: {
		subscribe: (run: () => void) => {
			run();
			return () => {};
		}
	}
}));

if (!globalThis.matchMedia) {
	globalThis.matchMedia = () => ({
		addEventListener: () => {},
		addListener: () => {},
		dispatchEvent: () => false,
		matches: false,
		media: '',
		// eslint-disable-next-line unicorn/no-null
		onchange: null,
		removeEventListener: () => {},
		removeListener: () => {}
	});
}
