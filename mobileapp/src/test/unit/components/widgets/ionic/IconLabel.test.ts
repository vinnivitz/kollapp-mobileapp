import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import IconLabel from '$lib/components/widgets/ionic/IconLabel.svelte';

describe('widgets/ionic/IconLabel', () => {
	it('renders icon and label', () => {
		const { container } = render(IconLabel, {
			props: { icon: 'star', label: 'Test Label' }
		});
		const icon = container.querySelector('ion-icon');
		const text = container.querySelector('ion-text');
		expect(icon).toBeTruthy();
		expect(text?.textContent).toBe('Test Label');
	});

	it('applies bold class when bold=true', () => {
		const { container } = render(IconLabel, {
			props: { bold: true, icon: 'star', label: 'Bold' }
		});
		const div = container.querySelector('div');
		expect(div?.classList.contains('font-bold')).toBe(true);
	});

	it('does not apply bold class when bold=false', () => {
		const { container } = render(IconLabel, {
			props: { bold: false, icon: 'star', label: 'Normal' }
		});
		const div = container.querySelector('div');
		expect(div?.classList.contains('font-bold')).toBe(false);
	});

	it('applies color to ion-text', () => {
		const { container } = render(IconLabel, {
			props: { color: 'primary', icon: 'star', label: 'Colored' }
		});
		const text = container.querySelector('ion-text');
		expect(text?.getAttribute('color')).toBe('primary');
	});

	it('applies iconColor to ion-icon', () => {
		const { container } = render(IconLabel, {
			props: { icon: 'star', iconColor: 'danger', label: 'Icon' }
		});
		const icon = container.querySelector('ion-icon');
		expect(icon?.getAttribute('color')).toBe('danger');
	});

	it('uses color as iconColor when iconColor not provided', () => {
		const { container } = render(IconLabel, {
			props: { color: 'secondary', icon: 'star', label: 'Fallback' }
		});
		const icon = container.querySelector('ion-icon');
		expect(icon?.getAttribute('color')).toBe('secondary');
	});

	it('applies size class', () => {
		const { container } = render(IconLabel, {
			props: { icon: 'star', label: 'Large', size: 'lg' }
		});
		const div = container.querySelector('div');
		expect(div?.className).toContain('text-lg');
	});

	it('applies custom classList', () => {
		const { container } = render(IconLabel, {
			props: { classList: 'my-custom-class', icon: 'star', label: 'Custom' }
		});
		const div = container.querySelector('div');
		expect(div?.className).toContain('my-custom-class');
	});

	it('uses default size when not specified', () => {
		const { container } = render(IconLabel, {
			props: { icon: 'star', label: 'Normal' }
		});
		const div = container.querySelector('div');
		expect(div?.className).toContain('text-sm');
	});
});
