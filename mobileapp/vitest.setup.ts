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
