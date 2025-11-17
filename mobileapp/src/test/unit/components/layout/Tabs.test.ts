import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';
import type { RouteId } from '$app/types';

import Tabs from '$lib/components/layout/Tabs.svelte';

const mockState = vi.hoisted(
	() =>
		({
			navigating: undefined,
			page: { route: { id: '/home' } }
		}) as { page: { route: { id?: string } }; navigating?: { to: { route: { id?: string } } } }
);

function registerMocks(): void {
	vi.mock('$app/state', () => mockState);
}

function polyfills(): void {
	class FakeIonTabs extends HTMLElement {
		select(...arguments_: unknown[]): Promise<unknown> {
			return Promise.resolve(arguments_);
		}
	}
	const originalSelect = FakeIonTabs.prototype.select;

	FakeIonTabs.prototype.select = vi.fn(function (this: FakeIonTabs, ...arguments_: unknown[]) {
		return originalSelect.apply(this, arguments_);
	});

	customElements.define('ion-tabs', FakeIonTabs);
}

describe('Tabs Component', () => {
	beforeAll(() => {
		registerMocks();
		polyfills();
	});

	const tab: { icon: string; label: string; tab: RouteId } = { icon: 'homeIcon', label: 'Home', tab: '/' };
	const tabs = [tab];
	const childContent = 'Child content';
	const properties = {
		children: createRawSnippet(() => ({
			render: () => `<p>${childContent}</p>`
		})),
		tabs
	};

	it('renders children', async () => {
		mockState.page.route.id = '/home';
		mockState.navigating = { to: { route: { id: '/next' } } };

		const childContent = 'Child content';
		const { container } = render(Tabs, { props: properties });

		const ionTabs = container.querySelector('ion-tabs') as HTMLIonTabsElement;

		expect(ionTabs).toBeTruthy();
		expect(ionTabs.textContent).toContain(childContent);
	});

	it('tab selection works properly', async () => {
		mockState.page.route.id = '/';
		mockState.navigating = { to: { route: { id: '/next' } } };

		const { container, queryByText } = render(Tabs, { props: properties });
		const ionTabs = container.querySelector('ion-tabs') as HTMLIonTabsElement;
		const aboutTabButton = queryByText(tab.label)?.closest('ion-tab-button') as HTMLIonTabButtonElement;

		expect(aboutTabButton).toBeTruthy();

		await fireEvent.click(aboutTabButton);

		await waitFor(() => {
			expect(goto).toHaveBeenCalledWith(tab.tab);
			expect(ionTabs.select).toHaveBeenCalledWith(tab.tab);
		});
	});

	it('updates currentTabName from navigating in $effect and selects it on mount', async () => {
		mockState.page.route.id = '/home';
		mockState.navigating = { to: { route: { id: '/next' } } };

		const { container } = render(Tabs, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>content</p>` })),
				tabs: [{ icon: 'homeIcon', label: 'Home', tab: '/' }]
			}
		});

		const ionTabs = container.querySelector('ion-tabs') as HTMLIonTabsElement;
		expect(ionTabs).toBeTruthy();

		await waitFor(() => expect(ionTabs.select).toHaveBeenCalledWith('/next'));
	});

	it('falls back to PageRoute.HOME when page.route.id is undefined', async () => {
		mockState.page.route.id = undefined;
		mockState.navigating = undefined;

		const { container } = render(Tabs, {
			props: {
				children: createRawSnippet(() => ({ render: () => `<p>content</p>` })),
				tabs: [{ icon: 'homeIcon', label: 'Home', tab: '/' }]
			}
		});

		const ionTabs = container.querySelector('ion-tabs') as HTMLIonTabsElement;

		await waitFor(() => expect(ionTabs.select).toHaveBeenCalledWith('/'));
	});
});
