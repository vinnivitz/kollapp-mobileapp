import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import Menu from '$lib/components/layout/Menu.svelte';
import { PageRoute } from '$lib/models/routing';
import { triggerClickByLabel } from '$lib/utility';

const childText = 'Hello, world!';
const properties = { children: createRawSnippet(() => ({ render: () => `<p>${childText}</p>` })) };

const { searchItem } = vi.hoisted(() => ({
	searchItem: { icon: 'logOutOutline', id: '1', label: 'Test Item', route: '/test' }
}));

describe('Menu Component', () => {
	beforeAll(() => {
		vi.mock('$lib/api/resources', () => ({
			authResource: {
				logout: vi.fn()
			},
			searchableResource: {
				filter: vi.fn().mockResolvedValue([searchItem])
			}
		}));

		vi.mock('$lib/utility', () => ({
			triggerClickByLabel: vi.fn()
		}));
	});

	it('renders a searchbar and children', () => {
		const { container } = render(Menu, { props: properties });
		const ionContent = container.querySelector('ion-content');
		const searchbar = container.querySelector('ion-searchbar');

		expect(ionContent?.textContent).toContain(childText);
		expect(searchbar).toBeDefined();
	});

	it('should perform a search and navigate when a search result is clicked', async () => {
		const { container } = render(Menu, { props: properties });
		const ionContent = container.querySelector('ion-content');
		const ionMenu = container.querySelector('ion-menu') as HTMLIonMenuElement;
		const searchbar = container.querySelector('ion-searchbar');

		ionMenu.close = vi.fn();

		expect(ionContent?.textContent).toContain(childText);
		expect(ionMenu).toBeDefined();
		expect(searchbar).toBeDefined();

		await fireEvent(
			searchbar as HTMLIonSearchbarElement,
			new CustomEvent('ionInput', { detail: { value: searchItem.label } })
		);

		await waitFor(async () => {
			const listItem = container.querySelector('ion-item') as HTMLIonItemElement;

			expect(listItem?.textContent).toContain(searchItem.label);
			fireEvent.click(listItem);

			expect(ionMenu!.close).toHaveBeenCalled();

			await waitFor(() => {
				expect(goto).toHaveBeenCalledWith(searchItem.route);
				expect(triggerClickByLabel).toHaveBeenCalledWith(searchItem.label);
			});
		});
	});

	it('should not display search results when search is emptied', async () => {
		const { container, queryByText } = render(Menu, { props: properties });
		const searchbar = container.querySelector('ion-searchbar');
		const ionContent = container.querySelector('ion-content');
		const ionMenu = container.querySelector('ion-menu') as HTMLIonMenuElement;
		ionMenu.close = vi.fn();

		expect(ionContent?.textContent).toContain(childText);
		expect(ionMenu).toBeDefined();
		expect(searchbar).toBeDefined();

		await fireEvent(searchbar as HTMLIonSearchbarElement, new CustomEvent('ionInput', { detail: { value: '' } }));

		await waitFor(() => {
			expect(queryByText(searchItem.label)).toBeNull();
		});

		await fireEvent(searchbar as HTMLIonSearchbarElement, new CustomEvent('ionInput', { detail: { value: '' } }));

		await waitFor(() => {
			expect(queryByText(searchItem.label)).toBeNull();
		});
	});

	it('should go to AUTH.LOGIN when logout is clicked', async () => {
		const { container } = render(Menu, { props: properties });
		const logoutItem = container.querySelector('ion-button') as HTMLIonButtonElement;

		expect(logoutItem).toBeDefined();

		fireEvent.click(logoutItem);

		await waitFor(() => {
			expect(goto).toHaveBeenCalledWith(PageRoute.AUTH.LOGIN);
		});
	});
});
