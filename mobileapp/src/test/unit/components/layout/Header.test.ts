import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';
import type { RouteId } from '$app/types';

import Header from '$lib/components/layout/Header.svelte';

let storesInitialized = true;

const navigateBackMock = vi.hoisted(() => vi.fn().mockResolvedValue({}));

const loadedServerStore = vi.hoisted(() => ({
	subscribe(run: (v: boolean) => void) {
		run(storesInitialized);
		return vi.fn();
	}
}));

function registerMocks(): void {
	vi.mock('$lib/utility', () => ({
		navigateBack: navigateBackMock
	}));

	vi.mock('$lib/stores', () => ({
		initializationStore: {
			subscribe(run: (v: { loadedServer: { subscribe: (function_: (b: boolean) => void) => () => void } }) => void) {
				run({ loadedServer: loadedServerStore });
				return vi.fn();
			}
		}
	}));
}

describe('Header Component', () => {
	beforeAll(() => registerMocks());

	it('renders title correctly', () => {
		const properties = { title: 'Test Header' };
		const { container } = render(Header, { props: properties });

		const ionTitle = container.querySelector('ion-title');
		expect(ionTitle?.textContent).toBe(properties.title);
	});

	it('renders back button when showBackButton is true', () => {
		const properties = { showBackButton: true, title: 'Test Header' };
		const { container } = render(Header, { props: properties });

		const ionTitle = container.querySelector('ion-title');
		expect(ionTitle?.textContent).toBe(properties.title);

		const backButton = container.querySelector('ion-back-button');
		expect(backButton).toBeTruthy();
	});

	it('renders logo when showBackButton is false and clicking logo navigates home', async () => {
		const properties = { showBackButton: false, title: 'Test Header' };
		const { container, queryByAltText } = render(Header, { props: properties });

		const ionTitle = container.querySelector('ion-title');
		expect(ionTitle?.textContent).toBe(properties.title);

		expect(container.querySelector('ion-back-button')).toBeNull();

		const logo = queryByAltText('Logo') as HTMLImageElement;
		expect(logo).toBeTruthy();

		await fireEvent.click(logo);

		expect(goto).toHaveBeenCalledWith('/' satisfies RouteId);
	});
	it('do not render content if stores are not initialized', () => {
		storesInitialized = false;
		const properties = { title: 'Test Title' };
		const { container } = render(Header, { props: properties });

		expect(container.querySelector('ion-content')).toBeFalsy();
	});

	it('when not loading and store is loaded, progress bar remains hidden (showProgressBar = false)', async () => {
		vi.useFakeTimers();

		storesInitialized = true;

		const { container, rerender } = render(Header, {
			props: { loading: false, title: 'Progress Test' }
		});

		expect(container.querySelector('ion-progress-bar')).toBeFalsy();

		await vi.advanceTimersByTimeAsync(150);
		await tick();
		expect(container.querySelector('ion-progress-bar')).toBeFalsy();

		await rerender({ loading: true, title: 'Progress Test' });
		expect(container.querySelector('ion-progress-bar')).toBeFalsy();

		await vi.advanceTimersByTimeAsync(110);
		await tick();
		expect(container.querySelector('ion-progress-bar')).toBeTruthy();

		vi.useRealTimers();
	});

	it('clicking the left ion-button when showBackButton = true calls navigateBack()', async () => {
		const { container } = render(Header, {
			props: { showBackButton: true, title: 'Back Test' }
		});

		const leftButton = container.querySelector('ion-button') as HTMLIonButtonElement;
		expect(leftButton).toBeTruthy();

		await fireEvent.click(leftButton);
		await tick();

		expect(navigateBackMock).toHaveBeenCalledTimes(1);
	});

	it('keydown Enter on left ion-button triggers navigate() -> navigateBack() when showBackButton = true', async () => {
		const { container } = render(Header, {
			props: { showBackButton: true, title: 'Keydown Test' }
		});

		const leftButton = container.querySelector('ion-button') as HTMLIonButtonElement;
		expect(leftButton).toBeTruthy();

		await fireEvent.keyDown(leftButton, { key: 'Enter' });
		await tick();

		expect(navigateBackMock).toHaveBeenCalled();
	});

	it('keydown Enter with showBackButton = false triggers navigateTo(PageRoute.HOME)', async () => {
		const { container } = render(Header, {
			props: { showBackButton: false, title: 'Keydown Home' }
		});

		const leftButton = container.querySelector('ion-button') as HTMLIonButtonElement;
		expect(leftButton).toBeTruthy();

		await fireEvent.keyDown(leftButton, { key: 'Enter' });

		expect(goto).toHaveBeenCalledWith('/' satisfies RouteId);
	});
});
