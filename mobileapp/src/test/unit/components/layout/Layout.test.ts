/* eslint-disable unicorn/consistent-function-scoping */

import type { Readable } from 'svelte/store';

import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

let storesInitialized = true;
const navigate = vi.fn();
const fadeMock = vi.fn((_node: Element, options?: { delay?: number; duration?: number }) => ({
	delay: options?.delay ?? 0,
	duration: options?.duration ?? 0
}));

let LayoutComponent: typeof import('$lib/components/layout/Layout.svelte').default;

// Polyfill Web Animations API for jsdom so transitions/ionic don't crash
type MockAnimation = {
	effect: unknown;
	finished: Promise<void>;
	cancel(): void;
	finish(): void;
	pause(): void;
	play(): void;
};

if (
	!(Element.prototype as unknown as { animate?: (this: Element, ...arguments_: unknown[]) => MockAnimation }).animate
) {
	const mockAnimate = vi.fn(function (this: Element, ..._arguments: unknown[]): MockAnimation {
		return {
			cancel: () => {},
			effect: {},
			finish: () => {},
			finished: Promise.resolve(),
			pause: () => {},
			play: () => {}
		};
	});

	(Element.prototype as unknown as { animate?: (this: Element, ...arguments_: unknown[]) => MockAnimation }).animate =
		mockAnimate as unknown as (this: Element, ...arguments_: unknown[]) => MockAnimation;
}

const makeReadable = (value: boolean): Readable<boolean> => ({
	subscribe: (run: (v: boolean) => void) => {
		run(value);
		return () => {};
	}
});

function registerMocks(): void {
	// Mock transition fade before importing the component so we can capture options
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
			navigate
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
	beforeAll(async () => {
		registerMocks();
		const module_ = await import('$lib/components/layout/Layout.svelte');
		LayoutComponent = module_.default;
	});
	beforeEach(() => {
		storesInitialized = true;
		fadeMock.mockClear();
	});

	it('renders child content', () => {
		const childText = 'Hello, world!';
		const properties = {
			children: createRawSnippet(() => ({ render: () => `<p>${childText}</p>` })),
			title: 'Test Title'
		};

		const { container } = render(LayoutComponent, { props: properties });
		const ionContent = container.querySelector('ion-content');

		expect(ionContent?.textContent).toContain(childText);
	});

	it('applies no-overflow class when scrollable is false', () => {
		const properties = { scrollable: false, title: 'Test Title' };

		const { container } = render(LayoutComponent, { props: properties });
		const ionContent = container.querySelector('ion-content');

		expect(ionContent?.classList.contains('no-overflow')).toBeTruthy();
	});

	it('does not render Header when hideLayout is true', () => {
		const properties = { hideLayout: true, title: 'Test Title' };
		const { queryByTestId } = render(LayoutComponent, { props: properties });

		expect(queryByTestId('header-stub')).toBeNull();
	});

	it('does not render Menu when hideMenu is true', () => {
		const properties = { hideMenu: true, title: 'Test Title' };
		const { queryByTestId } = render(LayoutComponent, { props: properties });

		expect(queryByTestId('menu-stub')).toBeNull();
	});

	it('does not render content if stores are not initialized', () => {
		storesInitialized = false;
		const properties = { hideLayout: false, hideMenu: false, title: 'Test Title' };
		const { container } = render(LayoutComponent, { props: properties });

		expect(container.querySelector('ion-content')).toBeFalsy();
	});

	it('renders ion-refresher and calls onRefresh when refreshed', async () => {
		const onRefresh = vi.fn().mockResolvedValue({});
		const properties = { onRefresh, title: 'Test Title' };
		const { container } = render(LayoutComponent, { props: properties });
		const refresherElement = container.querySelector('ion-refresher') as HTMLElement;

		expect(refresherElement).toBeTruthy();

		await fireEvent(refresherElement, new CustomEvent('ionRefresh'));

		expect(onRefresh).toHaveBeenCalled();
	});

	it('renders ion-refresher, calls onRefresh, and calls refresher.complete()', async () => {
		const onRefresh = vi.fn().mockResolvedValue({});
		const properties = { onRefresh, title: 'Test Title' };
		const { container } = render(LayoutComponent, { props: properties });
		const refresherElement = container.querySelector('ion-refresher') as HTMLIonRefresherElement;

		expect(refresherElement).toBeTruthy();

		refresherElement.complete = vi.fn();

		await fireEvent(refresherElement, new CustomEvent('ionRefresh'));

		expect(onRefresh).toHaveBeenCalled();
		expect(refresherElement.complete).toHaveBeenCalled();
	});

	it('uses fade transition with delay 0 and duration 200', async () => {
		// Start with loading=true so content is not rendered initially
		const { rerender } = render(LayoutComponent, { props: { loading: true, title: 'Test Title' } });
		fadeMock.mockClear();
		// Toggle loading to false to introduce ion-content and trigger in:fade
		await rerender({ loading: false, title: 'Test Title' });
		expect(fadeMock).toHaveBeenCalled();
		const call = fadeMock.mock.calls.find((arguments_) => {
			const [, options_] = arguments_ as [Element, { delay?: number; duration?: number }];
			return typeof options_ === 'object' && 'delay' in (options_ || {});
		});
		expect(call).toBeTruthy();
		const [, options] = call as [Element, { delay?: number; duration?: number }];
		expect(options).toEqual(expect.objectContaining({ delay: 0, duration: 200 }));
	});
});
