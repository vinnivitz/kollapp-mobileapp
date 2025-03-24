import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import Tabs from '$lib/components/layout/Tabs.svelte';

beforeAll(() => {
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
});

describe('Tabs Component', () => {
	const tab = { icon: 'homeIcon', label: 'Home', tab: '/home' };
	const tabs = [tab];
	const childContent = 'Child content';
	const properties = {
		children: createRawSnippet(() => ({
			render: () => `<p>${childContent}</p>`
		})),
		tabs
	};

	it('renders children', async () => {
		const childContent = 'Child content';
		const { container } = render(Tabs, { props: properties });

		const ionTabs = container.querySelector('ion-tabs') as HTMLIonTabsElement;

		expect(ionTabs).toBeDefined();
		expect(ionTabs.textContent).toContain(childContent);
	});

	it('tab selection works properly', async () => {
		const { container, queryByText } = render(Tabs, { props: properties });
		const ionTabs = container.querySelector('ion-tabs') as HTMLIonTabsElement;
		const aboutTabButton = queryByText(tab.label)?.closest('ion-tab-button');

		expect(aboutTabButton).toBeTruthy();

		await fireEvent.click(aboutTabButton as HTMLIonTabButtonElement);

		await waitFor(() => {
			expect(goto).toHaveBeenCalledWith(tab.tab);
			expect(ionTabs.select).toHaveBeenCalledWith(tab.tab);
		});
	});
});
