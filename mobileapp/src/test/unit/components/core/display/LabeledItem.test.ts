import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import LabeledItem from '$lib/components/core/display/LabeledItem.svelte';

describe('widgets/ionic/LabeledItem', () => {
	it('renders label and passes through props', () => {
		const { container } = render(LabeledItem, {
			props: { color: 'white', icon: 'home', label: 'LBL' }
		});
		const label = container.querySelector('ion-label');
		expect(label).toBeTruthy();
		expect(label?.getAttribute('color')).toBe('dark');
	});

	it('renders with light color and uses dark label', () => {
		const { container } = render(LabeledItem, {
			props: { color: 'light', label: 'Test Label' }
		});
		const label = container.querySelector('ion-label');
		expect(label?.getAttribute('color')).toBe('dark');
	});

	it('renders with non-light color and uses white label', () => {
		const { container } = render(LabeledItem, {
			props: { color: 'primary', label: 'Test Label' }
		});
		const label = container.querySelector('ion-label');
		expect(label?.getAttribute('color')).toBe('white');
	});

	it('handles click callback', async () => {
		const clickedMock = vi.fn();
		const { container } = render(LabeledItem, {
			props: { clicked: clickedMock, label: 'Clickable' }
		});

		const item = container.querySelector('ion-item');
		await fireEvent.click(item!);
		expect(clickedMock).toHaveBeenCalled();
	});

	it('renders with badge', () => {
		const { container } = render(LabeledItem, {
			props: { badge: '5', label: 'With Badge' }
		});
		const badge = container.querySelector('ion-badge');
		expect(badge?.textContent).toBe('5');
	});

	it('renders with transparent style', () => {
		const { container } = render(LabeledItem, {
			props: { label: 'Transparent', transparent: true }
		});
		const item = container.querySelector('ion-item');
		expect(item).toBeTruthy();
	});

	it('renders with custom classList', () => {
		const { container } = render(LabeledItem, {
			props: { classList: 'custom-class', label: 'Custom' }
		});
		const item = container.querySelector('ion-item');
		expect(item?.className).toContain('custom-class');
	});
});
