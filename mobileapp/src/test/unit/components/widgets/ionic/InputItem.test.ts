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
});
