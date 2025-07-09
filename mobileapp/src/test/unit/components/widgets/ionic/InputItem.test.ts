import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import ItemInput from '$lib/components/widgets/ionic/TextInputItem.svelte';

describe('CustomItemInput Component', () => {
	it('renders ion-input with correct attributes', () => {
		const properties = {
			helperText: 'Helper text here',
			label: 'Test Label',
			name: 'testName',
			type: 'email' as const,
			value: 'john@doe.com'
		};
		const { container } = render(ItemInput, { props: properties });
		const ionInput = container.querySelector('ion-input');

		expect(ionInput).toBeTruthy();
		expect(ionInput?.getAttribute('label')).toBe(properties.label);
		expect(ionInput?.getAttribute('name')).toBe(properties.name);
		expect(ionInput?.getAttribute('type')).toBe(properties.type);
		expect(ionInput?.getAttribute('value')).toBe(properties.value);
		expect(ionInput?.getAttribute('helper-text')).toBe(properties.helperText);
	});

	it('calls the change callback on ionInput event', async () => {
		const changeMock = vi.fn();
		const properties = {
			change: changeMock,
			label: 'Test Label',
			name: 'testName'
		};

		const { container } = render(ItemInput, { props: properties });

		const ionInput = container.querySelector('ion-input') as HTMLIonInputElement;
		expect(ionInput).toBeTruthy();

		const newValue: string | undefined = 'new value';
		const event = new CustomEvent('ionInput', { detail: { value: newValue } });
		await fireEvent(ionInput, event);

		expect(changeMock).toHaveBeenCalledWith(newValue);

		const newValue2 = undefined;
		const event2 = new CustomEvent('ionInput', { detail: { value: newValue2 } });
		await fireEvent(ionInput, event2);

		expect(changeMock).toHaveBeenCalledWith('');
	});
});
