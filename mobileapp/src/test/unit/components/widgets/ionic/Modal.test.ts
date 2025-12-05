import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Modal from '$lib/components/widgets/ionic/Modal.svelte';

const children = createRawSnippet(() => ({ render: () => `<div>Child Content</div>` }));

describe('widgets/ionic/Modal', () => {
	it('renders header with buttons and handles dismiss/confirm', async () => {
		const dismissed = vi.fn();
		const confirmed = vi.fn();
		const { container } = render(Modal, {
			props: { children, confirmed, dismissed, labels: true, open: true, title: 'T' }
		});
		const startButton = container.querySelector(
			'ion-buttons[slot="start"] ion-button, ion-buttons[slot="start"] ion-button, ion-buttons[slot="start"] ion-button'
		);
		const endButton = container.querySelector(
			'ion-buttons[slot="end"] ion-button, ion-buttons[slot="end"] ion-button, ion-buttons[slot="end"] ion-button'
		);
		if (startButton) await fireEvent.click(startButton);
		if (endButton) await fireEvent.click(endButton);
		expect(dismissed).toHaveBeenCalled();
		expect(confirmed).toHaveBeenCalled();
	});

	it('supports informational back button', async () => {
		const dismissed = vi.fn();
		const { container } = render(Modal, {
			props: { children, dismissed, informational: true, open: true, title: 'Info' }
		});
		const backButton = container.querySelector('ion-buttons[slot="start"] ion-button');
		if (backButton) await fireEvent.keyDown(backButton, { key: 'Enter' });
		expect(dismissed).toHaveBeenCalled();
	});
});
