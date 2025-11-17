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
		subscribe: vi.fn()
	}),
	get: vi.fn(),
	readable: () => ({
		subscribe: vi.fn()
	}),
	writable: () => ({
		set: vi.fn(),
		subscribe: vi.fn()
	})
}));

vi.mock('$lib/locales', () => ({
	locale: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return vi.fn();
		}
	},
	t: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return vi.fn();
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
			return vi.fn();
		}
	},
	localeStore: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return vi.fn();
		}
	},
	modalStore: {
		subscribe: (run: () => void) => {
			run();
			return vi.fn();
		}
	}
}));

if (!globalThis.matchMedia) {
	globalThis.matchMedia = () => ({
		addEventListener: vi.fn(),
		addListener: vi.fn(),
		dispatchEvent: () => false,
		matches: false,
		media: '',
		// eslint-disable-next-line unicorn/no-null
		onchange: null,
		removeEventListener: vi.fn(),
		removeListener: vi.fn()
	});
}
