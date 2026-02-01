import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Modal from '$lib/components/widgets/ionic/Modal.svelte';

const children = createRawSnippet(() => ({ render: () => `<div>Child Content</div>` }));

describe('widgets/ionic/Modal', () => {
	it('renders header with buttons and handles dismiss/confirm', async () => {
		const confirmed = vi.fn();
		const { container } = render(Modal, {
			props: { children, confirmed, labels: true, open: true, title: 'T' }
		});
		const startButton = container.querySelector(
			'ion-buttons[slot="start"] ion-button, ion-buttons[slot="start"] ion-button, ion-buttons[slot="start"] ion-button'
		);
		const endButton = container.querySelector(
			'ion-buttons[slot="end"] ion-button, ion-buttons[slot="end"] ion-button, ion-buttons[slot="end"] ion-button'
		);
		// Buttons should exist
		expect(startButton).toBeTruthy();
		expect(endButton).toBeTruthy();
		if (endButton) await fireEvent.click(endButton);
		expect(confirmed).toHaveBeenCalled();
	});

	it('supports informational back button', async () => {
		const { container } = render(Modal, {
			props: { children, informational: true, open: true, title: 'Info' }
		});
		const backButton = container.querySelector('ion-buttons[slot="start"] ion-button');
		// Back button should exist in informational mode
		expect(backButton).toBeTruthy();
	});

	it('does not navigate on non-Enter key in informational mode', async () => {
		const dismissed = vi.fn();
		const { container } = render(Modal, {
			props: { children, dismissed, informational: true, open: true, title: 'Info' }
		});
		const backButton = container.querySelector('ion-buttons[slot="start"] ion-button');
		if (backButton) await fireEvent.keyDown(backButton, { key: 'Space' });
		expect(dismissed).not.toHaveBeenCalled();
	});

	it('renders with lazy prop when open', () => {
		const { container } = render(Modal, {
			props: { children, lazy: true, open: true, title: 'Lazy' }
		});

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();
	});

	it('does not render when lazy and closed', () => {
		const { container } = render(Modal, {
			props: { children, lazy: true, open: false, title: 'Hidden' }
		});

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeFalsy();
	});

	it('renders without labels', () => {
		const { container } = render(Modal, {
			props: { children, labels: false, open: true, title: 'No Labels' }
		});

		const buttons = container.querySelectorAll('ion-button');
		expect(buttons.length).toBeGreaterThan(0);
	});

	it('disables confirm button when touched is false', () => {
		const { container } = render(Modal, {
			props: { children, open: true, title: 'Untouched', touched: false }
		});

		const endButtons = container.querySelector('ion-buttons[slot="end"]');
		const confirmButton = endButtons?.querySelector('ion-button');
		expect(confirmButton?.hasAttribute('disabled')).toBe(true);
	});

	it('renders with custom classList', () => {
		const { container } = render(Modal, {
			props: { children, classList: 'custom-modal-class', open: true, title: 'Custom' }
		});

		const modal = container.querySelector('ion-modal.custom-modal-class');
		expect(modal).toBeTruthy();
	});

	it('renders child content', () => {
		const { getByText } = render(Modal, {
			props: { children, open: true, title: 'Content Test' }
		});

		expect(getByText('Child Content')).toBeTruthy();
	});

	it('renders without breakpoints', () => {
		const { container } = render(Modal, {
			props: { breakpoints: false, children, open: true, title: 'No Breakpoints' }
		});

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();
		expect(modal?.getAttribute('breakpoints')).toBeNull();
	});
});
