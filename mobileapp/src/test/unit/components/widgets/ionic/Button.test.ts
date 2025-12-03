import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Button from '$lib/components/widgets/ionic/Button.svelte';

describe('widgets/ionic/Button', () => {
	it('renders label and handles click', async () => {
		const clicked = vi.fn();
		const { container } = render(Button, { props: { clicked, label: 'Label' } });
		const button = container.querySelector('ion-button')!;
		await fireEvent.click(button);
		expect(clicked).toHaveBeenCalledTimes(1);
	});

	it('renders icon-only when no label', () => {
		const { container } = render(Button, { props: { icon: 'some-icon', type: 'submit' } });
		const icon = container.querySelector('ion-icon[slot="icon-only"]');
		expect(icon).toBeTruthy();
	});

	it('applies bold label when outline', () => {
		const { container } = render(Button, { props: { fill: 'outline', label: 'Test', type: 'submit' } });
		const label = container.querySelector('ion-text');
		expect(label?.className).toContain('font-extrabold');
	});

	it('fires on Enter keydown', async () => {
		const clicked = vi.fn();
		const { container } = render(Button, { props: { clicked, label: 'Enter' } });
		const button = container.querySelector('ion-button')!;
		await fireEvent.keyDown(button, { key: 'Enter' });
		expect(clicked).toHaveBeenCalled();
	});
});
