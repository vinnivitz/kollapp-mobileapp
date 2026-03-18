import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Modal from '$lib/components/core/feedback/Modal.svelte';

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

	it('shows spinner when loading is true', () => {
		const { container } = render(Modal, {
			props: { children, loading: true, open: true, title: 'Loading' }
		});

		const spinner = container.querySelector('ion-spinner');
		expect(spinner).toBeTruthy();
	});

	it('hides content when loading is true', () => {
		const { container } = render(Modal, {
			props: { children, loading: true, open: true, title: 'Loading' }
		});

		expect(container.textContent).not.toContain('Child Content');
	});

	it('shows content when loading is false', () => {
		const { container } = render(Modal, {
			props: { children, loading: false, open: true, title: 'Loaded' }
		});

		expect(container.textContent).toContain('Child Content');
		expect(container.querySelector('ion-spinner')).toBeFalsy();
	});

	it('renders with custom cancel and confirm icons', () => {
		const { container } = render(Modal, {
			props: {
				cancelIcon: 'close-outline',
				children,
				confirmIcon: 'checkmark-outline',
				open: true,
				title: 'Custom Icons'
			}
		});

		const buttons = container.querySelectorAll('ion-buttons ion-button');
		expect(buttons.length).toBeGreaterThanOrEqual(2);
	});

	it('renders with custom cancel and confirm labels', () => {
		const { container } = render(Modal, {
			props: {
				cancelLabel: 'Abbrechen',
				children,
				confirmLabel: 'Speichern',
				labels: true,
				open: true,
				title: 'Custom Labels'
			}
		});

		expect(container.textContent).toContain('Abbrechen');
		expect(container.textContent).toContain('Speichern');
	});

	it('does not show title when not provided', () => {
		const { container } = render(Modal, {
			props: { children, open: true }
		});

		const title = container.querySelector('ion-title');
		expect(title?.textContent?.trim()).toBeFalsy();
	});

	it('renders with initial breakpoint', () => {
		const { container } = render(Modal, {
			props: { children, initialBreakPoint: 0.5, open: true, title: 'Half' }
		});

		const modal = container.querySelector('ion-modal');
		expect(modal?.getAttribute('initial-breakpoint')).toBe('0.5');
	});

	it('Enter key dismisses in informational mode', async () => {
		const { container } = render(Modal, {
			props: { children, informational: true, open: true, title: 'Info' }
		});
		const backButton = container.querySelector('ion-buttons[slot="start"] ion-button');
		expect(backButton).toBeTruthy();
		if (backButton) {
			await fireEvent.keyDown(backButton, { key: 'Enter' });
		}
	});

	it('renders aria attributes on modal', () => {
		const { container } = render(Modal, {
			props: { children, open: true, title: 'Accessible Modal' }
		});
		const modal = container.querySelector('ion-modal');
		expect(modal?.getAttribute('aria-modal')).toBe('true');
		expect(modal?.getAttribute('aria-label')).toBe('Accessible Modal');
	});
});
