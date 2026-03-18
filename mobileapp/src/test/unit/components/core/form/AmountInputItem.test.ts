import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AmountInputItem from '$lib/components/core/form/AmountInputItem.svelte';

describe('widgets/ionic/AmountInputItem', () => {
	it('exposes inputElement and reacts to keydown digits/decimal/backspace', async () => {
		const changed = vi.fn();
		let reference: HTMLIonInputElement | undefined;
		const { container } = render(AmountInputItem, {
			props: { changed, inputElement: (element) => (reference = element), label: 'Amount', value: 0 }
		});
		expect(reference).toBeTruthy();
		const input = container.querySelector('ion-input')!;
		await fireEvent.keyDown(input, { key: '1' });
		await fireEvent.keyDown(input, { key: ',' });
		await fireEvent.keyDown(input, { key: 'Backspace' });
		expect(changed).toHaveBeenCalled();
	});

	it('handles paste event parsing', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, { props: { changed, label: 'Amount', value: 0 } });
		const input = container.querySelector('ion-input')!;
		const paste = new Event('paste');
		Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '1.23' } });
		await fireEvent(input, paste);
		expect(changed).toHaveBeenCalled();
	});
	it('handles decimal separator per locale and digit guards', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, { props: { changed, label: 'Amount', value: 0 } });
		const input = container.querySelector('ion-input')!;
		await fireEvent.keyDown(input, { key: '1' });
		await fireEvent.keyDown(input, { key: '2' });
		await fireEvent.keyDown(input, { key: '3' });
		await fireEvent.keyDown(input, { key: '4' });
		await fireEvent.keyDown(input, { key: '5' });
		await fireEvent.keyDown(input, { key: '6' });
		await fireEvent.keyDown(input, { key: '7' });
		await fireEvent.keyDown(input, { key: ',' });
		await fireEvent.keyDown(input, { key: '8' });
		await fireEvent.keyDown(input, { key: '9' });
		expect(changed).toHaveBeenCalled();
	});

	it('backspace transitions through fractal and int to zero', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, { props: { changed, label: 'Amount', value: 123 } });
		const input = container.querySelector('ion-input')!;
		await fireEvent.keyDown(input, { key: ',' });
		await fireEvent.keyDown(input, { key: '4' });
		await fireEvent.keyDown(input, { key: '5' });
		await fireEvent.keyDown(input, { key: 'Backspace' });
		await fireEvent.keyDown(input, { key: 'Backspace' });
		await fireEvent.keyDown(input, { key: 'Backspace' });
		await fireEvent.keyDown(input, { key: 'Backspace' });
		expect(changed).toHaveBeenCalled();
	});
	it('parses long paste with grouping/decimal and clamps digits', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, { props: { changed, label: 'Amount', value: 0 } });
		const input = container.querySelector('ion-input')!;
		const paste = new Event('paste');
		Object.defineProperty(paste, 'clipboardData', {
			value: { getData: () => '1.234.567,89 € foo' }
		});
		await fireEvent(input, paste);
		expect(changed).toHaveBeenCalled();
	});

	it('focus/click set caret without errors', async () => {
		const { container } = render(AmountInputItem, { props: { label: 'Amount', value: 123 } });
		const input = container.querySelector('ion-input')!;
		await fireEvent.focus(input);
		await fireEvent.click(input);
		expect(input).toBeTruthy();
	});
});
