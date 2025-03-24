import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, test } from 'vitest';

import { goto } from '$app/navigation';

import Header from '$lib/components/layout/Header.svelte';
import { PageRoute } from '$lib/models/routing';

describe('Header Component', () => {
	test('renders title correctly', () => {
		const properties = { title: 'Test Header' };
		const { container } = render(Header, { props: properties });

		const ionTitle = container.querySelector('ion-title');
		expect(ionTitle?.textContent).toBe(properties.title);
	});

	test('renders back button when showBackButton is true', () => {
		const properties = { showBackButton: true, title: 'Test Header' };
		const { container } = render(Header, { props: properties });

		const ionTitle = container.querySelector('ion-title');
		expect(ionTitle?.textContent).toBe(properties.title);

		const backButton = container.querySelector('ion-back-button');
		expect(backButton).toBeDefined();
	});

	test('renders logo when showBackButton is false and clicking logo navigates home', async () => {
		const properties = { showBackButton: false, title: 'Test Header' };
		const { container, queryByAltText } = render(Header, { props: properties });

		const ionTitle = container.querySelector('ion-title');
		expect(ionTitle?.textContent).toBe(properties.title);

		expect(container.querySelector('ion-back-button')).toBeNull();

		const logo = queryByAltText('Logo');
		expect(logo).toBeTruthy();

		await fireEvent.click(logo as HTMLElement);

		expect(goto).toHaveBeenCalledWith(PageRoute.HOME);
	});
});
