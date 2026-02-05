import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';

describe('widgets/ionic/InputItem', () => {
	it('calls changed on ionInput and exposes inputElement', async () => {
		const changed = vi.fn();
		let reference: HTMLIonInputElement | undefined;
		const { container } = render(InputItem, {
			props: {
				changed,
				inputElement: (element) => (reference = element),
				label: 'Label',
				value: 'abc'
			}
		});
		expect(reference).toBeTruthy();
		const input = container.querySelector('ion-input')!;
		await fireEvent(input, new CustomEvent('ionInput', { detail: { value: 'xyz' } }));
		expect(changed).toHaveBeenCalledWith('xyz');
	});

	it('fires input icon click via end button', async () => {
		const clicked = vi.fn();
		const { container } = render(InputItem, {
			props: { icon: 'start', inputIcon: 'search', inputIconClicked: clicked, label: 'Lbl', value: '' }
		});
		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		expect(clicked).toHaveBeenCalled();
	});

	it('renders with name prop', () => {
		const { container } = render(InputItem, {
			props: { label: 'Field', name: 'fieldName' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.getAttribute('name')).toBe('fieldName');
	});

	it('renders with type prop', () => {
		const { container } = render(InputItem, {
			props: { label: 'Password', name: 'pass', type: 'password' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.getAttribute('type')).toBe('password');
	});

	it('renders disabled state', () => {
		const { container } = render(InputItem, {
			props: { disabled: true, label: 'Disabled', name: 'field' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.hasAttribute('disabled')).toBe(true);
	});

	it('renders readonly state', () => {
		const { container } = render(InputItem, {
			props: { label: 'Readonly', name: 'field', readonly: true }
		});
		const input = container.querySelector('ion-input');
		expect(input?.hasAttribute('readonly')).toBe(true);
	});

	it('renders with maxlength and counter', () => {
		const { container } = render(InputItem, {
			props: { label: 'Limited', maxlength: 50, name: 'limited' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.getAttribute('maxlength')).toBe('50');
		expect(input?.getAttribute('counter')).toBe('true');
	});

	it('renders with helperText', () => {
		const { container } = render(InputItem, {
			props: { helperText: 'Enter your email', label: 'Email', name: 'email' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.getAttribute('helper-text')).toBe('Enter your email');
	});

	it('renders with pattern prop', () => {
		const { container } = render(InputItem, {
			props: { label: 'Code', name: 'code', pattern: '[A-Z]{3}' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.getAttribute('pattern')).toBe('[A-Z]{3}');
	});

	it('renders with inputmode prop', () => {
		const { container } = render(InputItem, {
			props: { inputmode: 'numeric', label: 'Number', name: 'num' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.getAttribute('inputmode')).toBe('numeric');
	});

	it('renders hidden when hidden=true', () => {
		const { container } = render(InputItem, {
			props: { hidden: true, label: 'Hidden', name: 'hidden' }
		});
		const hiddenElement = container.querySelector('.hidden');
		expect(hiddenElement).toBeTruthy();
	});

	it('renders with custom classList', () => {
		const { container } = render(InputItem, {
			props: { classList: 'custom-input-class', label: 'Custom', name: 'custom' }
		});
		const input = container.querySelector('ion-input');
		expect(input?.classList.contains('custom-input-class')).toBe(true);
	});

	it('handles empty ionInput value', async () => {
		const changed = vi.fn();
		const { container } = render(InputItem, {
			props: { changed, label: 'Label', value: 'abc' }
		});
		const input = container.querySelector('ion-input')!;
		await fireEvent(input, new CustomEvent('ionInput', { detail: { value: undefined } }));
		expect(changed).toHaveBeenCalledWith('');
	});
});
