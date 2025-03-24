import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Card from '$lib/components/widgets/Card.svelte';

describe('CardComponent', () => {
	const childContent = 'Child content';
	const children = createRawSnippet(() => ({
		render: () => `<p>${childContent}</p>`
	}));

	it('renders title, subtitle, and children correctly', () => {
		const properties = {
			children,
			subtitle: 'Test Subtitle',
			title: 'Test Title'
		};
		const { container } = render(Card, { props: properties });
		const ionCardTitle = container.querySelector('ion-card-title');
		const ionCardSubtitle = container.querySelector('ion-card-subtitle');
		const ionCardContent = container.querySelector('ion-card-content');

		expect(ionCardTitle?.textContent).toBe(properties.title);
		expect(ionCardSubtitle?.textContent).toBe(properties.subtitle);
		expect(ionCardContent?.textContent).toContain(childContent);
	});

	it('calls the click callback when the card is clicked', async () => {
		const clickMock = vi.fn();
		const properties = {
			children,
			click: clickMock
		};
		const { container } = render(Card, { props: properties });
		const ionCard = container.querySelector('ion-card');
		const ionCardContent = ionCard?.querySelector('ion-card-content');

		expect(ionCard).toBeTruthy();
		expect(ionCardContent?.textContent).toContain(childContent);

		await fireEvent.click(ionCard as HTMLIonCardElement);
		expect(clickMock).toHaveBeenCalled();
	});
});
