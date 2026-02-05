import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { goto } from '$app/navigation';

import OrganizationWidget from '$lib/components/widgets/quick-access/widgets/OrganizationWidget.svelte';

class MockIntersectionObserver {
	constructor(callback: IntersectionObserverCallback) {
		callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
	}
	disconnect = vi.fn();
	observe = vi.fn();
	takeRecords = vi.fn();
	unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const mockOrganization = {
	id: 1,
	name: 'Test Organization',
	personsOfOrganization: [
		{ id: 1, userId: 1, username: 'User 1' },
		{ id: 2, userId: 2, username: 'User 2' }
	]
};

describe('widgets/quick-access/widgets/OrganizationWidget', () => {
	it('renders organization name as title', () => {
		const { container } = render(OrganizationWidget, {
			props: { editMode: false, organization: mockOrganization as never }
		});
		expect(container.textContent).toContain('Test Organization');
	});

	it('shows member count in translated text', () => {
		const { container } = render(OrganizationWidget, {
			props: { editMode: false, organization: mockOrganization as never }
		});
		// Members are shown in translated text which includes the count
		expect(container.querySelector('ion-note')).toBeTruthy();
	});

	it('navigates to organization when clicked in normal mode', async () => {
		const { container } = render(OrganizationWidget, {
			props: { editMode: false, organization: mockOrganization as never }
		});
		const card = container.querySelector('ion-card')!;
		await fireEvent.click(card);
		expect(goto).toHaveBeenCalled();
	});

	it('does not navigate when in edit mode', async () => {
		vi.clearAllMocks();
		const { container } = render(OrganizationWidget, {
			props: { editMode: true, organization: mockOrganization as never }
		});
		const card = container.querySelector('ion-card')!;
		await fireEvent.click(card);
		expect(goto).not.toHaveBeenCalled();
	});

	it('shows arrow icon when not in edit mode', () => {
		const { container } = render(OrganizationWidget, {
			props: { editMode: false, organization: mockOrganization as never }
		});
		const icons = container.querySelectorAll('ion-card-title ion-icon');
		expect(icons.length).toBe(2); // start and end icon
	});

	it('hides arrow icon in edit mode', () => {
		const { container } = render(OrganizationWidget, {
			props: { editMode: true, organization: mockOrganization as never }
		});
		const icons = container.querySelectorAll('ion-card-title ion-icon');
		expect(icons.length).toBe(1); // only start icon
	});

	it('renders without organization', () => {
		const { container } = render(OrganizationWidget, {
			props: { editMode: false }
		});
		expect(container.querySelector('ion-card')).toBeTruthy();
	});
});
