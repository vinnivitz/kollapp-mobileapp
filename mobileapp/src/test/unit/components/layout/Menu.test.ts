import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import { authenticationResource } from '$lib/api/resources';
import Menu from '$lib/components/layout/Menu.svelte';
import { triggerClickByLabel } from '$lib/utility';

const childText = 'Hello, world!';
const properties = { children: createRawSnippet(() => ({ render: () => `<p>${childText}</p>` })) };

const { searchItem } = vi.hoisted(() => ({
	searchItem: { icon: 'logOutOutline', id: '1', label: 'Test Item', route: '/test' }
}));

describe('Menu Component', () => {
	beforeAll(() => {
		vi.mock('$lib/api/resources', () => ({
			authenticationResource: {
				logout: vi.fn()
			},
			searchableResource: {
				filter: vi.fn().mockResolvedValue([searchItem])
			}
		}));

		vi.mock('$lib/utility', () => ({
			featureNotImplementedAlert: vi.fn(),
			triggerClickByLabel: vi.fn()
		}));
	});

	it('renders a searchbar and children', () => {
		const { container } = render(Menu, { props: properties });
		const ionContent = container.querySelector('ion-content');
		const searchbar = container.querySelector('ion-searchbar');

		expect(ionContent?.textContent).toContain(childText);
		expect(searchbar).toBeTruthy();
	});

	it('should perform a search and navigate when a search result is clicked', async () => {
		const { container } = render(Menu, { props: properties });
		const ionContent = container.querySelector('ion-content');
		const ionMenu = container.querySelector('ion-menu') as HTMLIonMenuElement;
		const searchbar = container.querySelector('ion-searchbar');

		ionMenu.close = vi.fn();

		expect(ionContent?.textContent).toContain(childText);
		expect(ionMenu).toBeTruthy();
		expect(searchbar).toBeTruthy();

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
		expect(ionMenu).toBeTruthy();
		expect(searchbar).toBeTruthy();

		await fireEvent(searchbar as HTMLIonSearchbarElement, new CustomEvent('ionInput', { detail: { value: '' } }));

		await waitFor(() => {
			expect(queryByText(searchItem.label)).toBeNull();
		});

		await fireEvent(searchbar as HTMLIonSearchbarElement, new CustomEvent('ionInput', { detail: { value: '' } }));

		await waitFor(() => {
			expect(queryByText(searchItem.label)).toBeNull();
		});
	});

	it('calls logout when clicking the logout button', async () => {
		const { container } = render(Menu, { props: properties });
		const logoutButton = container.querySelectorAll('ion-button').item(1) as HTMLIonButtonElement;
		expect(logoutButton).toBeTruthy();
		await fireEvent.click(logoutButton);
		await waitFor(() => expect(authenticationResource.logout).toHaveBeenCalled());
	});
});
