import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import Layout from '$lib/components/layout/Layout.svelte';

function registerMocks(): void {
	vi.mock('$lib/stores', () => ({
		activitiesStore: {
			initialized: false
		},
		organizationStore: {
			initialized: false
		},
		userStore: {
			initialized: false
		}
	}));

	vi.mock('$lib/components/layout/Header.svelte', () => ({
		default: () => ({
			$$render: () => `<div data-testid="header-stub">Header</div>`
		})
	}));

	vi.mock('$lib/components/layout/Menu.svelte', () => ({
		default: () => ({
			$$render: () => `<div data-testid="menu-stub">Menu</div>`
		})
	}));
}

describe('Layout Component', () => {
	beforeAll(() => {
		registerMocks();
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

	it('renders ion-refresher and calls onRefresh when refreshed', async () => {
		const onRefresh = vi.fn();
		const properties = { onRefresh, title: 'Test Title' };
		const { container } = render(Layout, { props: properties });
		const refresherElement = container.querySelector('ion-refresher');

		expect(refresherElement).toBeDefined();

		await fireEvent(refresherElement as HTMLIonRefresherElement, new CustomEvent('ionRefresh'));

		expect(onRefresh).toHaveBeenCalledWith(refresherElement);
	});
});
