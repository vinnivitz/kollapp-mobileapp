import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Button from '$lib/components/widgets/Button.svelte';

describe('Button Component', () => {
	it('renders label and start icon with "outline" fill (font-extrabold)', () => {
		const properties = {
			click: vi.fn(),
			fill: 'outline' as const,
			icon: 'test-icon',
			iconPosition: 'start' as const,
			label: 'Click Me',
			size: 'large' as const
		};
		const { container } = render(Button, { props: properties });
		const ionText = container.querySelector('ion-text');
		const startIcon = container.querySelector('ion-icon[slot="start"]');

		expect(ionText).toBeTruthy();
		expect(ionText?.textContent).toBe(properties.label);
		expect(ionText?.classList.contains('font-extrabold')).toBeTruthy();
		expect(startIcon).toBeTruthy();
		expect(startIcon?.getAttribute('icon')).toBe(properties.icon);
		expect(startIcon?.getAttribute('size')).toBe('large');
	});

	it('renders label and end icon when iconPosition is "end"', () => {
		const properties = {
			click: vi.fn(),
			fill: 'default' as const,
			icon: 'test-icon',
			iconPosition: 'end' as const,
			label: 'Submit',
			size: 'large' as const
		};
		const { container } = render(Button, { props: properties });

		const ionText = container.querySelector('ion-text');
		const endIcon = container.querySelector('ion-icon[slot="end"]');

		expect(ionText).toBeTruthy();
		expect(ionText?.textContent).toBe(properties.label);
		expect(ionText?.classList.contains('font-medium')).toBeTruthy();
		expect(endIcon).toBeTruthy();
		expect(endIcon?.getAttribute('icon')).toBe(properties.icon);
		expect(endIcon?.getAttribute('size')).toBe('large');
	});

	it('renders icon only when no label is provided', () => {
		const properties = {
			click: vi.fn(),
			fill: 'solid' as const,
			icon: 'icon-only-test',
			size: 'large' as const
		};
		const { container } = render(Button, { props: properties });
		const ionText = container.querySelector('ion-text');
		const iconOnly = container.querySelector('ion-icon[slot="icon-only"]');

		expect(ionText).toBeNull();
		expect(iconOnly).toBeTruthy();
		expect(iconOnly?.getAttribute('icon')).toBe(properties.icon);
		expect(iconOnly?.getAttribute('size')).toBe('large');
	});

	it('calls the click callback when button is clicked', async () => {
		const clickMock = vi.fn();
		const properties = {
			click: clickMock,
			label: 'Press Me'
		};
		const { container } = render(Button, { props: properties });
		const ionButton = container.querySelector('ion-button');

		expect(ionButton).toBeTruthy();

		await fireEvent.click(ionButton as HTMLIonButtonElement);

		expect(clickMock).toHaveBeenCalled();
	});

	it('sets icon size to given size if not large', () => {
		const properties = {
			click: vi.fn(),
			icon: 'icon-only-test',
			iconSize: 'small' as const
		};
		const { container } = render(Button, { props: properties });
		const iconOnly = container.querySelector('ion-icon[slot="icon-only"]');

		expect(iconOnly).toBeTruthy();
		console.log('icon only', iconOnly);
		expect(iconOnly?.getAttribute('size')).toBe(properties.iconSize);

		const properties2 = {
			click: vi.fn(),
			icon: 'icon-only-test',
			iconSize: 'small' as const,
			label: 'Press Me'
		};
		const { container: container2 } = render(Button, { props: properties2 });
		const iconStart = container2.querySelector('ion-icon[slot="start"]');

		expect(iconStart).toBeTruthy();
		expect(iconStart?.getAttribute('size')).toBe(properties.iconSize);

		const properties3 = {
			click: vi.fn(),
			icon: 'icon-only-test',
			iconPosition: 'end' as const,
			iconSize: 'small' as const,
			label: 'Press Me'
		};
		const { container: container3 } = render(Button, { props: properties3 });
		const iconEnd = container3.querySelector('ion-icon[slot="end"]');

		expect(iconEnd).toBeTruthy();
		expect(iconEnd?.getAttribute('size')).toBe(properties3.iconSize);
	});
});
