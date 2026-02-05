import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';

describe('widgets/ionic/TextareaInputItem', () => {
	it('calls change on ionInput', async () => {
		const change = vi.fn();
		const { container } = render(TextareaInputItem, { props: { changed: change, label: 'Tx', value: 'a' } });
		const ta = container.querySelector('ion-textarea') as HTMLIonTextareaElement;
		await fireEvent(ta, new CustomEvent('ionInput', { detail: { value: 'hello' } }));
		expect(change).toHaveBeenCalledWith('hello');
	});

	it('renders with name prop', () => {
		const { container } = render(TextareaInputItem, {
			props: { label: 'Notes', name: 'notesField' }
		});
		const textarea = container.querySelector('ion-textarea');
		expect(textarea?.getAttribute('name')).toBe('notesField');
	});

	it('renders disabled state', () => {
		const { container } = render(TextareaInputItem, {
			props: { disabled: true, label: 'Disabled', name: 'field' }
		});
		const textarea = container.querySelector('ion-textarea');
		expect(textarea?.hasAttribute('disabled')).toBe(true);
	});

	it('renders readonly state', () => {
		const { container } = render(TextareaInputItem, {
			props: { label: 'Readonly', name: 'field', readonly: true }
		});
		const textarea = container.querySelector('ion-textarea');
		expect(textarea?.hasAttribute('readonly')).toBe(true);
	});

	it('renders with maxlength and counter', () => {
		const { container } = render(TextareaInputItem, {
			props: { label: 'Limited', maxlength: 500, name: 'limited' }
		});
		const textarea = container.querySelector('ion-textarea');
		expect(textarea?.getAttribute('maxlength')).toBe('500');
		expect(textarea?.getAttribute('counter')).toBe('true');
	});

	it('renders with placeholder', () => {
		const { container } = render(TextareaInputItem, {
			props: { label: 'Notes', name: 'notes', placeholder: 'Enter notes here...' }
		});
		const textarea = container.querySelector('ion-textarea');
		expect(textarea?.getAttribute('placeholder')).toBe('Enter notes here...');
	});

	it('renders hidden when hidden=true', () => {
		const { container } = render(TextareaInputItem, {
			props: { hidden: true, label: 'Hidden', name: 'hidden' }
		});
		const hiddenElement = container.querySelector('.hidden');
		expect(hiddenElement).toBeTruthy();
	});

	it('renders with icon', () => {
		const { container } = render(TextareaInputItem, {
			props: { icon: 'document', label: 'Notes', name: 'notes' }
		});
		const icon = container.querySelector('ion-icon[slot="start"]');
		expect(icon).toBeTruthy();
	});

	it('renders with iconEnd and triggers click', async () => {
		const iconClicked = vi.fn();
		const { container } = render(TextareaInputItem, {
			props: { iconEnd: 'send', inputIconClicked: iconClicked, label: 'Message', name: 'msg' }
		});
		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		expect(iconClicked).toHaveBeenCalled();
	});

	it('handles empty ionInput value', async () => {
		const change = vi.fn();
		const { container } = render(TextareaInputItem, { props: { changed: change, label: 'Tx', value: 'a' } });
		const ta = container.querySelector('ion-textarea') as HTMLIonTextareaElement;
		await fireEvent(ta, new CustomEvent('ionInput', { detail: { value: undefined } }));
		expect(change).toHaveBeenCalledWith('');
	});
});
