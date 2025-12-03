import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, type Mock } from 'vitest';

import { goto } from '$app/navigation';
import type { RouteId } from '$app/types';

import { authenticationService, searchableService } from '$lib/api/services';
import Menu from '$lib/components/layout/Menu.svelte';

const childHtml = 'Content';

const children = createRawSnippet(() => ({ render: () => `<div>${childHtml}</div>` }));

describe('Menu', () => {
	it('renders children when search is empty and shows logout', () => {
		const { container } = render(Menu, {
			props: { children }
		});

		expect(container.querySelector('ion-content')).toBeTruthy();
		const logoutLabel = container.querySelector('ion-content button, ion-content ion-button');
		expect(logoutLabel).toBeTruthy();
	});

	it('filters search results and lists items header', async () => {
		(searchableService.filter as Mock).mockResolvedValueOnce([
			{ icon: 'homeOutline', id: '1', label: 'Item', route: '/' }
		]);

		const { container } = render(Menu, {
			props: { children }
		});

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		const event = new CustomEvent('ionInput', { detail: { value: 'i' } });
		searchbar.dispatchEvent(event);

		await Promise.resolve();

		const list = container.querySelector('ion-list');
		expect(list).toBeTruthy();
	});

	it('navigate closes menu and calls goto', async () => {
		const { component } = render(Menu, {
			props: { children }
		});

		await component.navigate('/account' as RouteId);
		expect(goto).toHaveBeenCalled();
	});

	it('logout triggers authenticationService.logout', async () => {
		const { container } = render(Menu, {
			props: { children }
		});

		const button = container.querySelector('ion-content button, ion-content ion-button') as HTMLIonButtonElement;
		await fireEvent.click(button);
		expect(authenticationService.logout).toHaveBeenCalled();
	});
});
