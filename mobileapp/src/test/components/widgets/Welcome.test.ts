import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Welcome from '$lib/components/widgets/Welcome.svelte';

describe('Welcome Component', () => {
	it('renders welcome component correcty', () => {
		const { container } = render(Welcome);
		const ionImg = container.querySelector('ion-img');
		const ionText = container.querySelector('ion-text');
		const ionNote = container.querySelector('ion-note');

		expect(ionImg).toBeDefined();
		expect(ionText).toBeDefined();
		expect(ionNote).toBeDefined();
	});
});
