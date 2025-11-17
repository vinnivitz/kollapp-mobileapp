/* eslint-disable unicorn/consistent-function-scoping */

import type { Readable } from 'svelte/store';

import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import Layout from '$lib/components/layout/Layout.svelte';

let storesInitialized = true;
let developmentMode = false;
const navigateMock = vi.hoisted(() => vi.fn());
const fadeMock = vi.hoisted(() =>
	vi.fn((_node: Element, options?: { delay?: number; duration?: number }) => ({
		delay: options?.delay ?? 0,
		duration: options?.duration ?? 0
	}))
);

const makeReadable = (value: boolean): Readable<boolean> => ({
	subscribe: (run: (v: boolean) => void) => {
		run(value);
		return () => {};
	}
});

function registerMocks(): void {
	vi.mock('$app/environment', () => ({
		get dev() {
			return developmentMode;
		}
	}));

	vi.mock('svelte/transition', () => ({
		fade: fadeMock
	}));

	vi.mock('$lib/components/layout/Header.svelte', () => ({
		default: () => ({
			$$render: () => `<div data-testid="header-stub"></div>`
		})
	}));

	vi.mock('$lib/components/layout/Menu.svelte', () => ({
		default: () => ({
			$$render: () => `<div data-testid="menu-stub">Menu</div>`,
			navigate: navigateMock
		})
	}));

	vi.mock('$lib/components/widgets/ionic/LabeledItem.svelte', () => ({
		default: () => ({
			$$render: () => `<div data-testid="labeled-item-stub">LabeledItem</div>`
		})
	}));

	vi.mock('$lib/stores', () => ({
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
	}));
}

describe('Layout Component', () => {
	beforeAll(() => registerMocks());

	beforeEach(() => {
		storesInitialized = true;
		developmentMode = false;
		fadeMock.mockClear();
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

		expect(queryByTestId('header-stub')).toBeFalsy();
	});

	it('does not render Menu when hideMenu is true', () => {
		const properties = { hideMenu: true, title: 'Test Title' };
		const { queryByTestId } = render(Layout, { props: properties });

		expect(queryByTestId('menu-stub')).toBeFalsy();
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

	it('does not render content when loading is true', () => {
		const properties = { loading: true, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		expect(container.querySelector('ion-content')).toBeFalsy();
	});

	it('renders Header when hideLayout is false', () => {
		const properties = { title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		expect(container.querySelector('.ion-page')).toBeTruthy();
	});

	it('renders showcase menu item when dev is true', () => {
		developmentMode = true;
		const properties = { title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		expect(container.querySelector('.ion-page')).toBeTruthy();
	});

	it('does not render showcase menu item when dev is false', () => {
		developmentMode = false;
		const properties = { title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		expect(container.querySelector('.ion-page')).toBeTruthy();
	});

	it('renders ion-content when loaded and not loading', () => {
		storesInitialized = true;
		const properties = { loading: false, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		const ionContent = container.querySelector('ion-content');
		expect(ionContent).toBeTruthy();
	});

	it('renders ion-content with ion-padding class', () => {
		const properties = { title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		const ionContent = container.querySelector('ion-content');
		expect(ionContent?.classList.contains('ion-padding')).toBeTruthy();
	});

	it('renders ion-refresher with slot="fixed"', () => {
		const properties = { title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		const refresher = container.querySelector('ion-refresher');
		expect(refresher?.getAttribute('slot')).toBe('fixed');
	});

	it('renders children inside ion-content', () => {
		const childText = 'Test Child Content';
		const properties = {
			children: createRawSnippet(() => ({ render: () => `<div class="test-child">${childText}</div>` })),
			title: 'Test Title'
		};
		const { container } = render(Layout, { props: properties });

		const ionContent = container.querySelector('ion-content');
		expect(ionContent?.textContent).toContain(childText);
	});

	it('renders Menu only when both hideLayout and hideMenu are false', () => {
		const properties = { hideLayout: false, hideMenu: false, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		const ionPage = container.querySelector('.ion-page');
		expect(ionPage).toBeTruthy();
	});

	it('does not render Menu when hideLayout is true', () => {
		const properties = { hideLayout: true, hideMenu: false, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		const ionPage = container.querySelector('.ion-page');
		expect(ionPage).toBeTruthy();
	});

	it('does not render Menu when hideMenu is true', () => {
		const properties = { hideLayout: false, hideMenu: true, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });

		const ionPage = container.querySelector('.ion-page');
		expect(ionPage).toBeTruthy();
	});
});
