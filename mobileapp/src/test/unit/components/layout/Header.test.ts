import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import Header from '$lib/components/layout/Header.svelte';
import { navigateBack } from '$lib/utility';

/**
 * Header component tests
 *
 * Note: The "not loaded" state (when initializationStore.loadedServer is false)
 * is tested in Header.notloaded.test.ts because it requires a different vi.mock()
 * for the stores module. Due to vi.mock() hoisting behavior and Svelte's module
 * compilation, we cannot use vi.doMock() with dynamic imports for Svelte components.
 */
describe('Header', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('navigation', () => {
		it('shows back button and navigates back when clicked', async () => {
			const { getByRole } = render(Header, {
				props: { loading: false, showBackButton: true, title: 'Any' }
			});

			const button = getByRole('button');
			await fireEvent.click(button);
			expect(navigateBack).toHaveBeenCalled();
		});

		it('shows back button and navigates back when Enter key is pressed', async () => {
			const { getByRole } = render(Header, {
				props: { loading: false, showBackButton: true, title: 'Any' }
			});

			const button = getByRole('button');
			await fireEvent.keyDown(button, { key: 'Enter' });
			expect(navigateBack).toHaveBeenCalled();
		});

		it('does not navigate when non-Enter key is pressed', async () => {
			const { getByRole } = render(Header, {
				props: { loading: false, showBackButton: true, title: 'Any' }
			});

			const button = getByRole('button');
			await fireEvent.keyDown(button, { key: 'Space' });
			expect(navigateBack).not.toHaveBeenCalled();
			expect(goto).not.toHaveBeenCalled();
		});

		it('shows logo and navigates home when clicked', async () => {
			const { container, getByRole } = render(Header, {
				props: { loading: false, showBackButton: false, title: 'Any' }
			});

			const logo = container.querySelector('img');
			expect(logo).toBeTruthy();
			expect(logo?.alt).toBe('accessibility.logo');

			const button = getByRole('button');
			await fireEvent.click(button);
			expect(goto).toHaveBeenCalled();
		});

		it('shows logo and navigates home when Enter key is pressed', async () => {
			const { getByRole } = render(Header, {
				props: { loading: false, showBackButton: false, title: 'Any' }
			});

			const button = getByRole('button');
			await fireEvent.keyDown(button, { key: 'Enter' });
			expect(goto).toHaveBeenCalled();
		});
	});

	describe('rendering', () => {
		it('displays the title correctly', () => {
			const { container } = render(Header, {
				props: { loading: false, showBackButton: false, title: 'Test Title' }
			});

			const ionTitle = container.querySelector('ion-title');
			expect(ionTitle?.textContent).toBe('Test Title');
		});

		it('shows menu button', () => {
			const { container } = render(Header, {
				props: { loading: false, showBackButton: false, title: 'Any' }
			});

			const menuButton = container.querySelector('ion-menu-button');
			expect(menuButton).toBeTruthy();
		});
	});

	describe('loading state', () => {
		it('shows progress bar when loading persists >100ms', async () => {
			vi.useFakeTimers();
			const { container, rerender } = render(Header, {
				props: { loading: true, showBackButton: false, title: 'Any' }
			});

			vi.advanceTimersByTime(150);
			await Promise.resolve();
			expect(container.querySelector('ion-progress-bar')).toBeTruthy();

			rerender({ loading: false, showBackButton: false, title: 'Any' });
			vi.advanceTimersByTime(150);
			expect(container.querySelector('ion-progress-bar')).toBeFalsy();
		});
	});
});
