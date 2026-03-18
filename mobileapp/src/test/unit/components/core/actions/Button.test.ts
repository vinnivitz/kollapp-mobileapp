import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Button from '$lib/components/core/actions/Button.svelte';

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

	it('renders with start icon and label', () => {
		const { container } = render(Button, { props: { icon: 'home', label: 'Home', type: 'submit' } });
		const startIcon = container.querySelector('ion-icon[slot="start"]');
		expect(startIcon).toBeTruthy();
	});

	it('renders with end icon and label', () => {
		const { container } = render(Button, { props: { iconEnd: 'arrow-right', label: 'Next', type: 'submit' } });
		const endIcon = container.querySelector('ion-icon[slot="end"]');
		expect(endIcon).toBeTruthy();
	});

	it('renders with badge', () => {
		const { container } = render(Button, { props: { badge: '3', label: 'Notifications', type: 'submit' } });
		const badge = container.querySelector('ion-badge');
		expect(badge?.textContent).toBe('3');
	});

	it('applies disabled state', () => {
		const { container } = render(Button, { props: { disabled: true, label: 'Disabled', type: 'submit' } });
		const button = container.querySelector('ion-button');
		expect(button?.getAttribute('disabled')).toBe('true');
	});

	it('renders in readonly mode with no pointer events', () => {
		const { container } = render(Button, { props: { label: 'Readonly', readonly: true, type: 'submit' } });
		const button = container.querySelector('ion-button');
		expect(button?.style.pointerEvents).toBe('none');
	});

	it('applies expand prop', () => {
		const { container } = render(Button, { props: { expand: 'block', label: 'Block', type: 'submit' } });
		const button = container.querySelector('ion-button');
		expect(button?.getAttribute('expand')).toBe('block');
	});

	it('applies shape prop', () => {
		const { container } = render(Button, { props: { label: 'Round', shape: 'round', type: 'submit' } });
		const button = container.querySelector('ion-button');
		expect(button?.getAttribute('shape')).toBe('round');
	});

	it('renders with tourId data attribute', () => {
		const { container } = render(Button, { props: { label: 'Tour', tourId: 'tour-1', type: 'submit' } });
		const button = container.querySelector('ion-button');
		expect(button?.dataset.tour).toBe('tour-1');
	});

	it('renders with labelColor', () => {
		const { container } = render(Button, { props: { label: 'Colored', labelColor: 'primary', type: 'submit' } });
		const text = container.querySelector('ion-text');
		expect(text?.getAttribute('color')).toBe('primary');
	});

	it('renders with custom badgeColor', () => {
		const { container } = render(Button, {
			props: { badge: '5', badgeColor: 'warning', label: 'Badge', type: 'submit' }
		});
		const badge = container.querySelector('ion-badge');
		expect(badge?.getAttribute('color')).toBe('warning');
	});

	it('applies font-medium when fill is not outline', () => {
		const { container } = render(Button, { props: { fill: 'solid', label: 'Solid', type: 'submit' } });
		const text = container.querySelector('ion-text');
		expect(text?.className).toContain('font-medium');
	});

	it('renders with both start and end icons', () => {
		const { container } = render(Button, {
			props: { icon: 'home', iconEnd: 'arrow-forward', label: 'Both', type: 'submit' }
		});
		const startIcon = container.querySelector('ion-icon[slot="start"]');
		const endIcon = container.querySelector('ion-icon[slot="end"]');
		expect(startIcon).toBeTruthy();
		expect(endIcon).toBeTruthy();
	});

	it('uses label as ariaLabel when ariaLabel not provided', () => {
		const { container } = render(Button, { props: { label: 'Accessible', type: 'submit' } });
		const button = container.querySelector('ion-button');
		expect(button?.getAttribute('aria-label')).toBe('Accessible');
	});

	it('uses custom ariaLabel when provided', () => {
		const { container } = render(Button, { props: { ariaLabel: 'Custom Aria', label: 'Label', type: 'submit' } });
		const button = container.querySelector('ion-button');
		expect(button?.getAttribute('aria-label')).toBe('Custom Aria');
	});

	it('applies size prop to icon', () => {
		const { container } = render(Button, { props: { icon: 'home', size: 'large', type: 'submit' } });
		const icon = container.querySelector('ion-icon');
		expect(icon?.getAttribute('size')).toBe('large');
	});
});
