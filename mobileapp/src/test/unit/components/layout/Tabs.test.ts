import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';
import { navigating } from '$app/state';
import type { RouteId } from '$app/types';

import Tabs from '$lib/components/layout/Tabs.svelte';

const tabs = [
	{ icon: 'home', label: 'Home', tab: '/' as RouteId },
	{ icon: 'person', label: 'Account', tab: '/account' as RouteId }
];

describe('Tabs', () => {
	beforeEach(() => vi.clearAllMocks());
	it('renders tabs and selects on click', async () => {
		const { container } = render(Tabs, {
			props: { tabs }
		});

		const buttons = container.querySelectorAll('ion-tab-button');
		expect(buttons.length).toBe(2);

		const second = buttons[1] as HTMLElement;
		await fireEvent.click(second);
		expect(goto).toHaveBeenCalledWith('/account');
	});

	it('updates selected class based on currentTabName', () => {
		const { container } = render(Tabs, {
			props: { tabs }
		});

		const first = container.querySelector('ion-tab-button') as HTMLElement;
		expect(first.className).toContain('tab-selected');
	});

	it('Enter key on tab triggers navigation', async () => {
		const { container } = render(Tabs, { props: { tabs } });
		const second = container.querySelectorAll('ion-tab-button')[1] as HTMLElement;
		await fireEvent.keyDown(second, { key: 'Enter' });
		expect(goto).toHaveBeenCalledWith('/account');
	});

	it('ignores non-Enter keydown on tab button', async () => {
		const { container } = render(Tabs, { props: { tabs } });
		const second = container.querySelectorAll('ion-tab-button')[1] as HTMLElement;
		const keyEvent = new KeyboardEvent('keydown', { key: ' ' });
		await fireEvent(second, keyEvent);
		expect(goto).not.toHaveBeenCalledWith('/account');
	});

	it('applies navigating change on initial effect', () => {
		if (navigating.to) {
			navigating.to.route.id = '/account';
		}
		const { container } = render(Tabs, { props: { tabs } });
		const second = container.querySelectorAll('ion-tab-button')[1] as HTMLElement;
		expect(second.className).toContain('tab-selected');
	});

	it('does not update tab when pathname matches currentTabName', () => {
		if (navigating.to) {
			navigating.to.route.id = '/';
		}
		const { container } = render(Tabs, { props: { tabs } });
		const first = container.querySelectorAll('ion-tab-button')[0] as HTMLElement;
		expect(first.className).toContain('tab-selected');
	});

	it('sets tour id for organization and account tabs', () => {
		const tabsWithOrg = [
			{ icon: 'home', label: 'Home', tab: '/' as RouteId },
			{ icon: 'business', label: 'Organization', tab: '/organization' as RouteId },
			{ icon: 'person', label: 'Account', tab: '/account' as RouteId }
		];
		const { container } = render(Tabs, { props: { tabs: tabsWithOrg } });
		const buttons = container.querySelectorAll('ion-tab-button');
		// Organization tab should have a tour id
		expect(buttons[1]?.dataset.tour).toBeTruthy();
		// Account tab should have a tour id
		expect(buttons[2]?.dataset.tour).toBeTruthy();
		// Home tab should not have a tour id
		expect(buttons[0]?.dataset.tour).toBeFalsy();
	});
});
