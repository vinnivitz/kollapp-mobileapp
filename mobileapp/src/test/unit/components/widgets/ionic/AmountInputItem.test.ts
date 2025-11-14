import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';

// Hoisted mocks
const localeSubscribeMock = vi.hoisted(() =>
	vi.fn((run: (v: string) => void) => {
		run('en-US');
		return () => {};
	})
);

function registerMocks(): void {
	vi.mock('$lib/stores', () => ({
		localeStore: { subscribe: localeSubscribeMock }
	}));
}

describe('AmountInputItem', () => {
	let rafOrig: (callback: FrameRequestCallback) => number;

	beforeAll(() => registerMocks());

	beforeEach(() => {
		// Ensure requestAnimationFrame runs immediately for caret adjustments
		const g = globalThis;
		rafOrig = g.requestAnimationFrame;
		g.requestAnimationFrame = (callback: FrameRequestCallback) => {
			callback(0);
			return 0;
		};
		localeSubscribeMock.mockClear().mockImplementation((run: (v: string) => void) => {
			run('en-US');
			return () => {};
		});
	});

	afterEach(() => {
		// restore requestAnimationFrame
		const g = globalThis;
		g.requestAnimationFrame = rafOrig;
	});

	it('calls inputElement callback with bound ion-input', () => {
		const inputElementCallback = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { inputElement: inputElementCallback, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input');
		expect(ion).toBeTruthy();
		expect(inputElementCallback).toHaveBeenCalledWith(ion);
	});

	it('places caret before trailing unit on focus (e.g., "123 €")', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		expect(ion).toBeTruthy();

		const native = {
			setSelectionRange: vi.fn(),
			value: '123\u00A0€'
		};
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		// Focus triggers caret adjustment
		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalledWith(3, 3));
	});

	it('keeps caret at end when last char is a digit (e.g., "€ 123")', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const text = '€\u00A0123';
		const native = {
			setSelectionRange: vi.fn(),
			value: text
		};
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalledWith(text.length, text.length));
	});

	it('caret index is 0 for empty text on focus', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = {
			setSelectionRange: vi.fn(),
			value: ''
		};
		ion.getInputElement = vi.fn().mockResolvedValue(native);
		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalledWith(0, 0));
	});

	it('caret index is 0 for whitespace-only text on focus', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = {
			setSelectionRange: vi.fn(),
			value: ' \u00A0\u202F '
		};
		ion.getInputElement = vi.fn().mockResolvedValue(native);
		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalledWith(0, 0));
	});

	it('skips trailing whitespace before symbol and places caret before spaces/symbol', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const text = `123\u00A0€\u00A0\u202F`;
		const native = {
			setSelectionRange: vi.fn(),
			value: text
		};
		ion.getInputElement = vi.fn().mockResolvedValue(native);
		await fireEvent.focus(ion);
		// expected caret after '123' => index 3
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalledWith(3, 3));
	});

	it('onIonInput propagates changed value and fixes caret twice', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = { setSelectionRange: vi.fn(), value: '123\u00A0€' };
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		const detail = { value: '123\u00A0€' };
		await fireEvent(ion, new CustomEvent('ionInput', { detail }));

		expect(changed).toHaveBeenCalledWith('123\u00A0€');
		// called via raf twice with the computed index 3
		expect(native.setSelectionRange).toHaveBeenCalledWith(3, 3);
	});

	it('onIonInput sends empty string when detail.value is falsy', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		// native present so caret fix would run, but we focus on changed payload only
		const native = { setSelectionRange: vi.fn(), value: '123\u00A0€' };
		ion.getInputElement = vi.fn().mockResolvedValue(native);
		await fireEvent(ion, new CustomEvent('ionInput', { detail: { value: undefined } }));
		expect(changed).toHaveBeenCalledWith('');
	});

	it('onIonInput returns early when native is falsy', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		ion.getInputElement = vi.fn().mockResolvedValue({});
		await fireEvent(ion, new CustomEvent('ionInput', { detail: { value: 'x' } }));
		// changed still called, but no caret fixing due to native being falsy
		expect(changed).toHaveBeenCalledWith('x');
	});

	it('onIonInput fixes caret to 0 when native.value is falsy', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = { setSelectionRange: vi.fn(), value: '' };
		ion.getInputElement = vi.fn().mockResolvedValue(native);
		await fireEvent(ion, new CustomEvent('ionInput', { detail: { value: '' } }));
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalledWith(0, 0));
	});

	it('onKeyDown inserts decimal separator when absent and updates caret/changed', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;

		// Create a proper mock with mutable value property
		const native = {
			setSelectionRange: vi.fn(),
			value: '123\u00A0€'
		};

		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		// Press '.' which should map to '.' for en-US and insert before trailing unit
		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		// The handler should have been called
		expect(getInputSpy).toHaveBeenCalled();

		// Flush microtasks and animation frames
		await vi.runAllTimersAsync();

		expect(native.value).toBe('123.\u00A0€');
		expect(changed).toHaveBeenCalledWith('123.\u00A0€');
		expect(native.setSelectionRange).toHaveBeenCalledWith(4, 4);

		vi.useRealTimers();
	});

	it('onKeyDown does not insert a second decimal separator and just fixes caret', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = { setSelectionRange: vi.fn(), value: '123.\u00A0€' };

		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		expect(getInputSpy).toHaveBeenCalled();

		// value unchanged, changed not called again
		expect(native.value).toBe('123.\u00A0€');
		expect(changed).not.toHaveBeenCalled();

		await vi.runAllTimersAsync();
		expect(native.setSelectionRange).toHaveBeenCalledWith(4, 4);

		vi.useRealTimers();
	});

	it('onKeyDown inserts at start when native.value is empty', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = { setSelectionRange: vi.fn(), value: '' };

		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		expect(getInputSpy).toHaveBeenCalled();

		await vi.runAllTimersAsync();

		expect(native.value).toBe('.');
		expect(changed).toHaveBeenCalledWith('.');
		expect(native.setSelectionRange).toHaveBeenCalledWith(1, 1);

		vi.useRealTimers();
	});

	it('getDecimalSeparator falls back to comma when probe has no separator', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = { setSelectionRange: vi.fn(), value: '123\u00A0€' };

		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		// Mock Intl.NumberFormat to return a probe string without a separator ("11")
		const OriginalNF = Intl.NumberFormat;
		// @ts-expect-error Intl.Numberformat is being mocked
		Intl.NumberFormat = function mockNF() {
			return { format: () => '11' };
		};

		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		expect(getInputSpy).toHaveBeenCalled();

		await vi.runAllTimersAsync();

		expect(native.value).toBe('123,\u00A0€');
		expect(changed).toHaveBeenCalledWith('123,\u00A0€');
		expect(native.setSelectionRange).toHaveBeenCalledWith(4, 4);

		// restore
		Intl.NumberFormat = OriginalNF;
		vi.useRealTimers();
	});

	it('buildNumberFormat supports unit style', () => {
		const r = render(AmountInputItem, {
			props: { label: 'Distance', name: 'dist', style: 'unit', unit: 'kilometer', unitDisplay: 'short', value: 2 }
		});
		const ion = r.container.querySelector('ion-input') as HTMLIonInputElement;
		// Placeholder reflects unit style formatting of 0
		const placeholder = ion.getAttribute('placeholder');
		expect(placeholder).toBe(
			new Intl.NumberFormat('en-US', { style: 'unit', unit: 'kilometer', unitDisplay: 'short' }).format(0)
		);
		r.unmount();
	});

	it('buildNumberFormat supports decimal style', () => {
		const r = render(AmountInputItem, {
			props: { label: 'Count', name: 'count', style: 'decimal', value: 0 }
		});
		const ion = r.container.querySelector('ion-input') as HTMLIonInputElement;
		// Decimal style uses default fraction digits; placeholder should be '0'
		expect(ion.getAttribute('placeholder')).toBe(new Intl.NumberFormat('en-US', { style: 'decimal' }).format(0));
		r.unmount();
	});

	it('onKeyDown ignores other keys', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = { setSelectionRange: vi.fn(), value: '123\u00A0€' };
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		const event_ = new KeyboardEvent('keydown', { key: 'a' });
		await fireEvent(ion, event_);
		expect(changed).not.toHaveBeenCalled();
		expect(native.setSelectionRange).not.toHaveBeenCalled();
		expect(event_.defaultPrevented).toBe(false);
	});

	it('renders placeholder for zero/undefined and formatted value for positive numbers', () => {
		// Undefined/zero shows placeholder
		let r = render(AmountInputItem, { props: { label: 'Amount', name: 'amount' } });
		let ion = r.container.querySelector('ion-input') as HTMLIonInputElement;
		expect(ion.getAttribute('placeholder')).toBe(
			new Intl.NumberFormat('en-US', {
				currency: 'EUR',
				maximumFractionDigits: 2,
				minimumFractionDigits: 2,
				style: 'currency'
			}).format(0)
		);
		r.unmount();

		// Positive value shows formatted value
		const value = 1234.5;
		const expected = new Intl.NumberFormat('en-US', {
			currency: 'EUR',
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
			style: 'currency'
		}).format(value);
		r = render(AmountInputItem, { props: { label: 'Amount', name: 'amount', value } });
		ion = r.container.querySelector('ion-input') as HTMLIonInputElement;
		// The web component reflects as attribute in jsdom
		expect(ion.getAttribute('value') ?? ion.value).toBe(expected);
		r.unmount();
	});
});
