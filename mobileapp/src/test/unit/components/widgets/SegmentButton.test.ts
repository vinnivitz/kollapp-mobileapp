import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import SegmentButton from '$lib/components/widgets/ionic/SegmentButton.svelte'; // adjust the path as needed

describe('SegmentButton', () => {
	it('renders ion-segment-button with value and label', () => {
		const properties = {
			icon: 'heart-outline',
			label: 'Favorites',
			value: 'favorites'
		};

		const { container } = render(SegmentButton, { props: properties });

		const segmentButton = container.querySelector('ion-segment-button');
		const icon = container.querySelector('ion-icon');
		const label = container.querySelector('ion-label');

		expect(segmentButton).toBeTruthy();
		expect(segmentButton?.getAttribute('value')).toBe('favorites');

		expect(icon).toBeTruthy();
		expect(icon?.getAttribute('icon')).toBe('heart-outline');

		expect(label?.textContent).toBe('Favorites');
	});

	it('applies id if provided', () => {
		const properties = {
			icon: 'person-outline',
			id: 'profile-button',
			label: 'Profile',
			value: 'profile'
		};

		const { container } = render(SegmentButton, { props: properties });

		const segmentButton = container.querySelector('ion-segment-button');
		expect(segmentButton?.getAttribute('id')).toBe('profile-button');
	});
});
