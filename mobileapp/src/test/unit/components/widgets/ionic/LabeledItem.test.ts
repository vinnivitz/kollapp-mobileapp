import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';

describe('widgets/ionic/LabeledItem', () => {
	it('renders label and passes through props', () => {
		const { container } = render(LabeledItem, {
			props: { color: 'white', icon: 'home', label: 'LBL' }
		});
		const label = container.querySelector('ion-label');
		expect(label).toBeTruthy();
		expect(label?.getAttribute('color')).toBe('dark');
	});
});
