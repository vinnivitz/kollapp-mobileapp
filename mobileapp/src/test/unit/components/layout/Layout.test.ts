import type { Readable } from 'svelte/store';

import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Layout from '$lib/components/layout/Layout.svelte';

let storesInitialized = true;
const navigate = vi.fn();

const makeReadable = (value: boolean): Readable<boolean> => ({
	subscribe: (run: (v: boolean) => void) => {
		run(value);
		return () => {};
	}
});

vi.mock('$lib/components/layout/Header.svelte', () => ({
	default: () => ({
		$$render: () => `<div data-testid="header-stub"></div>`
	})
}));

vi.mock('$lib/components/layout/Menu.svelte', () => ({
	default: () => ({
		$$render: () => `<div data-testid="menu-stub">Menu</div>`,
		navigate
	})
}));

vi.mock('$lib/stores', () => {
	return {
		initializationStore: {
			subscribe: (run: (v: { loadedCache: Readable<boolean>; loadedServer: Readable<boolean> }) => void) => {
				run({
					loadedCache: makeReadable(storesInitialized),
					loadedServer: makeReadable(storesInitialized)
				});
				return () => {};
			}
		},
		organizationStore: {
			init: vi.fn().mockResolvedValue({})
		},
		userStore: {
			init: vi.fn().mockResolvedValue({})
		}
	};
});

describe('Layout Component', () => {
	beforeEach(() => {
		storesInitialized = true;
		navigate.mockClear();
	});

	it('renders child content', () => {
		const childText = 'Hello, world!';
		const properties = {
			children: createRawSnippet(() => ({ render: () => `<p>${childText}</p>` })),
			title: 'Test Title'
		};

		const { container } = render(Layout, { props: properties });
		const ionContent = container.querySelector('ion-content');

		expect(ionContent?.textContent).toContain(childText);
	});

	it('applies no-overflow class when scrollable is false', () => {
		const properties = { scrollable: false, title: 'Test Title' };

		const { container } = render(Layout, { props: properties });
		const ionContent = container.querySelector('ion-content');

		expect(ionContent?.classList.contains('no-overflow')).toBeTruthy();
	});

	it('does not render Header when hideLayout is true', () => {
		const properties = { hideLayout: true, title: 'Test Title' };
		const { queryByTestId } = render(Layout, { props: properties });

		expect(queryByTestId('header-stub')).toBeNull();
	});

	it('does not render Menu when hideMenu is true', () => {
		const properties = { hideMenu: true, title: 'Test Title' };
		const { queryByTestId } = render(Layout, { props: properties });

		expect(queryByTestId('menu-stub')).toBeNull();
	});

	it('does not render content if stores are not initialized', () => {
		storesInitialized = false;
		const properties = { hideLayout: false, hideMenu: false, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		expect(container.querySelector('ion-content')).toBeFalsy();
	});

	it('renders ion-refresher and calls onRefresh when refreshed', async () => {
		const onRefresh = vi.fn().mockResolvedValue({});
		const properties = { onRefresh, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });
		const refresherElement = container.querySelector('ion-refresher') as HTMLElement;

		expect(refresherElement).toBeTruthy();

		await fireEvent(refresherElement, new CustomEvent('ionRefresh'));

		expect(onRefresh).toHaveBeenCalled();
	});

	it('renders ion-refresher, calls onRefresh, and calls refresher.complete()', async () => {
		const onRefresh = vi.fn().mockResolvedValue({});
		const properties = { onRefresh, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });
		const refresherElement = container.querySelector('ion-refresher') as HTMLIonRefresherElement;

		expect(refresherElement).toBeTruthy();

		refresherElement.complete = vi.fn();

		await fireEvent(refresherElement, new CustomEvent('ionRefresh'));

		expect(onRefresh).toHaveBeenCalled();
		expect(refresherElement.complete).toHaveBeenCalled();
	});
});
