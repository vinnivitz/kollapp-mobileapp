import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import WelcomeWidget from '$lib/components/widgets/WelcomeWidget.svelte';

describe('widgets/WelcomeWidget', () => {
	it('renders logo image', () => {
		const { container } = render(WelcomeWidget);
		const img = container.querySelector('ion-img');
		expect(img).toBeTruthy();
	});

	it('renders heading text', () => {
		const { container } = render(WelcomeWidget);
		const primaryText = container.querySelector('ion-text[color="primary"]');
		expect(primaryText).toBeTruthy();
	});

	it('renders subheading text', () => {
		const { container } = render(WelcomeWidget);
		const mediumText = container.querySelector('ion-text[color="medium"]');
		expect(mediumText).toBeTruthy();
	});

	it('has centered layout', () => {
		const { container } = render(WelcomeWidget);
		const div = container.querySelector('div');
		expect(div?.className).toContain('text-center');
		expect(div?.className).toContain('items-center');
	});
});
