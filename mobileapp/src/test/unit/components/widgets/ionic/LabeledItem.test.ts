import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';

describe('LabeledItem Component', () => {
	it('renders the label inside an ion-label with the correct color for light backgrounds', () => {
		const properties = {
			color: 'light' as const,
			label: 'Test Label'
		};
		const { container } = render(LabeledItem, { props: properties });
		const ionLabel = container.querySelector('ion-label');

		expect(ionLabel).toBeTruthy();
		expect(ionLabel?.getAttribute('color')).toBe('dark');
		expect(ionLabel?.textContent).toBe(properties.label);
	});

	it('renders the label with a white color for non-light colors', () => {
		const properties = {
			color: 'primary' as const,
			label: 'Primary Label'
		};
		const { container } = render(LabeledItem, { props: properties });
		const ionLabel = container.querySelector('ion-label');

		expect(ionLabel).toBeTruthy();
		expect(ionLabel?.getAttribute('color')).toBe('white');
		expect(ionLabel?.textContent).toBe(properties.label);
	});
});
