import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Welcome from '$lib/components/shared/WelcomeBanner.svelte';

describe('widgets/Welcome', () => {
	it('Welcome renders logo and headings', () => {
		const { container } = render(Welcome);
		const img = container.querySelector('ion-img');
		const texts = container.querySelectorAll('ion-text');
		expect(img).toBeTruthy();
		expect(texts.length).toBe(2);
	});
});
