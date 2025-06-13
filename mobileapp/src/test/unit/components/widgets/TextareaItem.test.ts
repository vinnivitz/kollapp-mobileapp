import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import TextareaItem from '$lib/components/widgets/ionic/TextareaItem.svelte';

describe('TextareaItem Component', () => {
	it('renders ion-textarea with correct attributes', () => {
		const properties = {
			disabled: true,
			icon: 'pencil',
			label: 'Textarea Label',
			maxlength: 200,
			name: 'textareaName',
			placeholder: 'Enter text here...',
			value: 'Initial text'
		};

		const { container } = render(TextareaItem, { props: properties });
		const textarea = container.querySelector('ion-textarea');

		expect(textarea).toBeTruthy();
		expect(textarea?.getAttribute('label')).toBe(properties.label);
		expect(textarea?.getAttribute('name')).toBe(properties.name);
		expect(textarea?.getAttribute('placeholder')).toBe(properties.placeholder);
		expect(textarea?.getAttribute('value')).toBe(properties.value);
		expect(textarea?.getAttribute('maxlength')).toBe(properties.maxlength.toString());
		expect(textarea?.getAttribute('disabled')).not.toBeNull();
	});

	it('calls the change callback on ionInput event', async () => {
		const changeMock = vi.fn();
		const properties = {
			change: changeMock,
			label: 'Textarea Label',
			name: 'textareaName'
		};

		const { container } = render(TextareaItem, { props: properties });
		const textarea = container.querySelector('ion-textarea') as HTMLIonTextareaElement;

		expect(textarea).toBeTruthy();

		const newValue = 'Updated text';
		const event = new CustomEvent('ionInput', { detail: { value: newValue } });
		await fireEvent(textarea, event);

		expect(changeMock).toHaveBeenCalledWith(newValue);

		const event2 = new CustomEvent('ionInput', { detail: { value: undefined } });
		await fireEvent(textarea, event2);

		expect(changeMock).toHaveBeenCalledWith('');
	});
});
