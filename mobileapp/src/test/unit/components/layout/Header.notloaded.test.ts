import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

// Mock initializationStore so that loadedServer is false
vi.mock('$lib/stores', () => ({
	initializationStore: {
		subscribe: (
			run: (v: {
				loadedCache: { subscribe: (r: (v: boolean) => void) => () => void };
				loadedServer: { subscribe: (r: (v: boolean) => void) => () => void };
			}) => void
		) => {
			const readableFalse = {
				subscribe: (r: (v: boolean) => void) => {
					r(false);
					return vi.fn();
				}
			};
			run({ loadedCache: readableFalse, loadedServer: readableFalse });
			return vi.fn();
		}
	}
}));

import Header from '$lib/components/layout/Header.svelte';

describe('Header (not loaded)', () => {
	it('shows progress bar after delay when not loaded and not loading', async () => {
		vi.useFakeTimers();
		const { container } = render(Header, {
			props: { loadedServer: false, loading: false, showBackButton: false, title: 'Any' }
		});

		vi.advanceTimersByTime(150);
		await Promise.resolve();
		expect(container.querySelector('ion-progress-bar')).toBeTruthy();
		vi.useRealTimers();
	});
});
