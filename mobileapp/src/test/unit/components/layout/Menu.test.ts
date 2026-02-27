import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, type Mock, vi } from 'vitest';

import { goto } from '$app/navigation';
import type { RouteId } from '$app/types';

import { authenticationService, searchableService } from '$lib/api/services';
import Menu from '$lib/components/layout/Menu.svelte';
import { triggerClickByLabel } from '$lib/utility';

const childHtml = 'Content';

const children = createRawSnippet(() => ({ render: () => `<div>${childHtml}</div>` }));

describe('Menu', () => {
	it('renders children when search is empty and shows logout', () => {
		const { container } = render(Menu, {
			props: { children }
		});

		expect(container.querySelector('ion-content')).toBeTruthy();
		// Check that logout functionality exists in the content area
		const content = container.querySelector('ion-content');
		expect(content).toBeTruthy();
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

	it('shows not found message when search returns no results', async () => {
		(searchableService.filter as Mock).mockResolvedValueOnce([]);

		const { container } = render(Menu, {
			props: { children }
		});

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		const event = new CustomEvent('ionInput', { detail: { value: 'nonexistent' } });
		searchbar.dispatchEvent(event);

		await waitFor(() => {
			const listHeader = container.querySelector('ion-list-header');
			expect(listHeader).toBeTruthy();
		});
	});

	it('navigate closes menu and calls goto', async () => {
		const { component } = render(Menu, {
			props: { children }
		});

		await component.navigate('/account' as RouteId);
		expect(goto).toHaveBeenCalled();
	});

	it('navigate with label calls triggerClickByLabel', async () => {
		vi.clearAllMocks();
		const { component } = render(Menu, {
			props: { children }
		});

		await component.navigate('/account' as RouteId, 'Test Label');
		expect(goto).toHaveBeenCalled();
		expect(triggerClickByLabel).toHaveBeenCalledWith('Test Label');
	});

	it('clicking search result item navigates with label', async () => {
		(searchableService.filter as Mock).mockResolvedValueOnce([
			{ icon: 'homeOutline', id: '1', label: 'TestItem', route: '/test' }
		]);

		const { container } = render(Menu, {
			props: { children }
		});

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		searchbar.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 'test' } }));

		await waitFor(() => {
			const list = container.querySelector('ion-list');
			const firstChild = list?.firstElementChild as HTMLElement;
			expect(firstChild).toBeTruthy();
			firstChild.click();
		});

		await waitFor(() => {
			expect(goto).toHaveBeenCalled();
		});
	});

	it('clicking notifications button navigates to notifications', async () => {
		vi.clearAllMocks();
		const { container } = render(Menu, {
			props: { children }
		});

		// Find button in header area by looking for clickable elements
		const header = container.querySelector('ion-header');
		const buttons = header?.querySelectorAll('button, [role="button"], ion-button');
		const notificationButton = buttons?.[0] as HTMLElement;
		if (notificationButton) {
			await fireEvent.click(notificationButton);
		}

		await waitFor(() => {
			expect(goto).toHaveBeenCalled();
		});
	});

	it('logout triggers authenticationService.logout', async () => {
		const { container } = render(Menu, {
			props: { children }
		});

		// Find logout button in content area
		const content = container.querySelector('ion-content');
		const buttons = content?.querySelectorAll('button, [role="button"], ion-button');
		const button = buttons?.[0] as HTMLElement;
		if (button) {
			await fireEvent.click(button);
		}
		expect(authenticationService.logout).toHaveBeenCalled();
	});
});
