import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import Header from '$lib/components/layout/Header.svelte';
import { navigateBack } from '$lib/utility';

describe('Header', () => {
	it('shows back button and navigates back when clicked', async () => {
		const { getByRole } = render(Header, {
			props: { loading: false, showBackButton: true, title: 'Any' }
		});

		const button = getByRole('button');
		await fireEvent.click(button);
		expect(navigateBack).toHaveBeenCalled();
	});

	it('shows logo and navigates home when clicked', async () => {
		const { getByAltText, getByRole } = render(Header, {
			props: { loading: false, showBackButton: false, title: 'Any' }
		});

		expect(getByAltText('Logo')).toBeTruthy();

		const button = getByRole('button');
		await fireEvent.click(button);
		expect(goto).toHaveBeenCalled();
	});

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

		vi.useRealTimers();
	});
});
