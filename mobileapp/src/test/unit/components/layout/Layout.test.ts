import { render, waitFor } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import Layout from '$lib/components/layout/Layout.svelte';
import { refreshDataStores } from '$lib/utility';

const childHtml = 'Content';

const children = createRawSnippet(() => ({ render: () => `<div>${childHtml}</div>` }));

describe('Layout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	afterEach(() => {
		vi.resetModules();
	});
	it('renders children', () => {
		const { container } = render(Layout, {
			props: { children, hideMenu: false, loading: false, scrollable: true, title: 'Any' }
		});
		const page = container.querySelector('#menu') as HTMLElement;
		const contentDiv = page.querySelector('ion-content div')?.textContent?.trim();
		expect(contentDiv).toBe(childHtml);
	});
	it('renders Header and Menu when title present and not hidden', () => {
		const { container } = render(Layout, {
			props: { children, hideMenu: false, loading: false, scrollable: true, title: 'Any' }
		});

		expect(container.querySelector('ion-header')).toBeTruthy();
		expect(container.querySelector('ion-menu')).toBeTruthy();
	});

	it('does not render children while loading is true', () => {
		const { container } = render(Layout, {
			props: { children, loading: true, title: 'Any' }
		});
		const page = container.querySelector('#menu') as HTMLElement;
		// Content element exists but children are not rendered
		expect(page.querySelector('ion-content')).toBeTruthy();
		expect(page.querySelector('ion-refresher')).toBeFalsy();
	});

	it('hides Menu when hideMenu is true', () => {
		const { container } = render(Layout, {
			props: { children, hideMenu: true, title: 'Any' }
		});
		expect(container.querySelector('ion-menu')).toBeFalsy();
	});

	it('does not render Header when title is missing', () => {
		const { container } = render(Layout, {
			props: { children, hideMenu: false, loading: false, scrollable: true }
		});
		expect(container.querySelector('ion-header')).toBeFalsy();
	});

	it('renders content only when loaded and not loading', async () => {
		const { container, rerender } = render(Layout, {
			props: { children, loading: true, title: 'Any' }
		});
		const page = container.querySelector('#menu') as HTMLElement;
		// Content element exists but refresher is not rendered during loading
		expect(page.querySelector('ion-refresher')).toBeFalsy();

		await rerender({ children, loading: false, title: 'Any' });
		expect(page.querySelector('ion-content')).toBeTruthy();
		expect(page.querySelector('ion-refresher')).toBeTruthy();
	});

	it('applies no-overflow when scrollable=false', () => {
		const { container } = render(Layout, {
			props: { children, loading: false, scrollable: false, title: 'Any' }
		});
		const content = (container.querySelector('#menu') as HTMLElement).querySelector('ion-content') as HTMLElement;
		expect(content.className).toContain('no-overflow');
	});

	it('does not apply no-overflow when scrollable=true (default)', () => {
		const { container } = render(Layout, {
			props: { children, loading: false, title: 'Any' }
		});
		const content = (container.querySelector('#menu') as HTMLElement).querySelector('ion-content') as HTMLElement;
		expect(content.className).not.toContain('no-overflow');
	});

	it('fires default refresh: calls refreshDataStores and completes refresher', async () => {
		const { container } = render(Layout, {
			props: { children, loading: false, title: 'Any' }
		});

		const refresher = (container.querySelector('#menu') as HTMLElement).querySelector(
			'ion-refresher'
		) as HTMLIonRefresherElement;
		expect(refresher).toBeTruthy();

		refresher.dispatchEvent(new CustomEvent('ionRefresh', { detail: {} }));
		await waitFor(() => {
			expect(refreshDataStores).toHaveBeenCalled();
			expect(refresher.complete).toHaveBeenCalled();
		});
	});

	it('clicking menu items triggers navigation via Menu.navigate', async () => {
		const { container } = render(Layout, {
			props: { children, hideMenu: false, loading: false, title: 'Any' }
		});
		const items = [...container.querySelectorAll('ion-list ion-item')] as HTMLElement[];
		expect(items.length).toBeGreaterThanOrEqual(2);
		for (const element of items) {
			element.click();
		}
		await waitFor(() => {
			expect(goto).toHaveBeenCalled();
		});
	});

	it('fires custom onRefresh and completes refresher', async () => {
		const onRefresh = vi.fn().mockResolvedValue(vi.fn());
		const { container } = render(Layout, {
			props: { children, loading: false, onRefresh, title: 'Any' }
		});

		const refresher = (container.querySelector('#menu') as HTMLElement).querySelector(
			'ion-refresher'
		) as HTMLIonRefresherElement;
		refresher.dispatchEvent(new CustomEvent('ionRefresh', { detail: {} }));
		await waitFor(() => {
			expect(onRefresh).toHaveBeenCalled();
			expect(refreshDataStores).not.toHaveBeenCalled();
			expect(refresher.complete).toHaveBeenCalled();
		});
	});
});
