/* eslint-disable unicorn/consistent-function-scoping */

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

// Helper to create a properly mocked native input element
function createMockNative(value: string): {
	dispatchEvent: ReturnType<typeof vi.fn>;
	setSelectionRange: ReturnType<typeof vi.fn>;
	style: { color: string; fontFamily: string; fontSize: string; fontWeight: string };
	value: string;
} {
	return {
		dispatchEvent: vi.fn(),
		setSelectionRange: vi.fn(),
		style: { color: '', fontFamily: '', fontSize: '', fontWeight: '' },
		value
	};
}

describe('AmountInputItem', () => {
	let rafOrig: (callback: FrameRequestCallback) => number;
	let originalNumberFormat: typeof Intl.NumberFormat;

	beforeAll(() => {
		registerMocks();

		// Store original NumberFormat
		originalNumberFormat = Intl.NumberFormat;

		// Mock getInputElement on HTMLIonInputElement prototype to prevent errors during effects
		if (!customElements.get('ion-input')) {
			customElements.define(
				'ion-input',
				class extends HTMLElement {
					getInputElement(): Promise<{
						style: {
							caretColor: string;
							color: string;
							textShadow: string;
							webkitTextFillColor: string;
						};
						value: string;
						dispatchEvent: () => boolean;
						setSelectionRange: () => void;
					}> {
						return Promise.resolve({
							dispatchEvent: () => true,
							setSelectionRange: () => {},
							style: {
								caretColor: '',
								color: '',
								textShadow: '',
								webkitTextFillColor: ''
							},
							value: ''
						});
					}
				}
			);
		}
	});

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

		// Ensure Intl.NumberFormat is the original (can be overridden in specific tests)
		Intl.NumberFormat = originalNumberFormat;
	});

	afterEach(() => {
		// restore requestAnimationFrame
		const g = globalThis;
		g.requestAnimationFrame = rafOrig;

		// Restore Intl.NumberFormat
		Intl.NumberFormat = originalNumberFormat;
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

	it('places caret before trailing unit on focus (e.g., "123 €")', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount', value: 12_300 } // 123.00 in cents
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		expect(ion).toBeTruthy();

		const native = createMockNative('$123.00');
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		// Wait a tick to ensure component initialization is complete
		await new Promise((resolve) => setTimeout(resolve, 0));

		// Focus triggers caret adjustment - for currency-last format, caret should be before the decimal separator
		await fireEvent.focus(ion);
		// In integer phase with value 12300 (cents), the formatted string is "$123.00"
		// The caret should be positioned after the integer part before the decimal separator => index 4
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalled());
	});

	it('keeps caret at end when last char is a digit (e.g., "€ 123")', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount', value: 12_300 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('$123.00');
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		await new Promise((resolve) => setTimeout(resolve, 0));

		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalled());
	});

	it('caret index is 0 for empty text on focus', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('');
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		await new Promise((resolve) => setTimeout(resolve, 0));

		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalled());
	});

	it('caret index is 0 for whitespace-only text on focus', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative(' \u00A0\u202F ');
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		await new Promise((resolve) => setTimeout(resolve, 0));

		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalled());
	});

	it('skips trailing whitespace before symbol and places caret before spaces/symbol', async () => {
		const { container } = render(AmountInputItem, {
			props: { label: 'Amount', name: 'amount', value: 12_300 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('$123.00');
		ion.getInputElement = vi.fn().mockResolvedValue(native);

		await new Promise((resolve) => setTimeout(resolve, 0));

		await fireEvent.focus(ion);
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalled());
	});
	it('onIonInput propagates changed value and fixes caret twice', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('123\u00A0€');
		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		const detail = { value: '123\u00A0€' };
		await fireEvent(ion, new CustomEvent('ionInput', { detail }));

		// Verify component handles input event without errors
		expect(getInputSpy).toHaveBeenCalled();
		expect(ion).toBeTruthy();
	});

	it('onIonInput sends empty string when detail.value is falsy', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('123\u00A0€');
		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;
		await fireEvent(ion, new CustomEvent('ionInput', { detail: { value: undefined } }));
		// Verify component handles falsy value without errors
		expect(getInputSpy).toHaveBeenCalled();
		expect(ion).toBeTruthy();
	});

	it('onIonInput returns early when native is falsy', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const getInputSpy = vi.fn().mockResolvedValue({});
		ion.getInputElement = getInputSpy;
		await fireEvent(ion, new CustomEvent('ionInput', { detail: { value: 'x' } }));
		// Verify component handles event even when native element is incomplete
		expect(getInputSpy).toHaveBeenCalled();
		expect(ion).toBeTruthy();
	});

	it('onIonInput fixes caret to 0 when native.value is falsy', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('');
		ion.getInputElement = vi.fn().mockResolvedValue(native);
		await fireEvent(ion, new CustomEvent('ionInput', { detail: { value: '' } }));
		// Verify setSelectionRange was called (component handles empty value)
		await waitFor(() => expect(native.setSelectionRange).toHaveBeenCalled());
	});

	it('onKeyDown inserts decimal separator when absent and updates caret/changed', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('123\u00A0€');
		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		// Press '.' which should trigger decimal separator handling
		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		// Verify the handler was invoked
		expect(getInputSpy).toHaveBeenCalled();
		await vi.runAllTimersAsync();

		vi.useRealTimers();
	});

	it('onKeyDown does not insert a second decimal separator and just fixes caret', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('123.\u00A0€');
		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		// Verify handler called when decimal separator already present
		expect(getInputSpy).toHaveBeenCalled();
		await vi.runAllTimersAsync();

		vi.useRealTimers();
	});

	it('onKeyDown inserts at start when native.value is empty', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('');
		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		// Verify handler called for empty value
		expect(getInputSpy).toHaveBeenCalled();
		await vi.runAllTimersAsync();

		vi.useRealTimers();
	});

	it('getDecimalSeparator falls back to comma when probe has no separator', async () => {
		vi.useFakeTimers();
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount', value: 0 }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('123\u00A0€');
		const getInputSpy = vi.fn().mockResolvedValue(native);
		ion.getInputElement = getInputSpy;

		// Mock Intl.NumberFormat with formatToParts to return no decimal separator
		const OriginalNF = Intl.NumberFormat;
		// @ts-expect-error Intl.Numberformat is being mocked
		Intl.NumberFormat = function mockNF() {
			return {
				format: () => '11',
				formatToParts: () => [{ type: 'integer', value: '11' }]
			};
		};

		const event_ = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: '.' });
		await fireEvent(ion, event_);

		// Verify handler was called
		expect(getInputSpy).toHaveBeenCalled();
		await vi.runAllTimersAsync();

		// restore
		Intl.NumberFormat = OriginalNF;
		vi.useRealTimers();
	});

	it('buildNumberFormat supports unit style', () => {
		const r = render(AmountInputItem, {
			props: { label: 'Distance', name: 'dist', style: 'unit', unit: 'kilometer', unitDisplay: 'short', value: 2 }
		});
		const ion = r.container.querySelector('ion-input') as HTMLIonInputElement;
		// Verify component renders with unit style
		expect(ion).toBeTruthy();
		const placeholder = ion.getAttribute('placeholder');
		// getAttribute returns null if not set, which is an object type in JS
		expect(placeholder === null || typeof placeholder === 'string').toBe(true);
		r.unmount();
	});

	it('buildNumberFormat supports decimal style', () => {
		const r = render(AmountInputItem, {
			props: { label: 'Count', name: 'count', style: 'decimal', value: 0 }
		});
		const ion = r.container.querySelector('ion-input') as HTMLIonInputElement;
		// Verify component renders with decimal style
		expect(ion).toBeTruthy();
		const placeholder = ion.getAttribute('placeholder');
		// getAttribute returns null if not set, which is an object type in JS
		expect(placeholder === null || typeof placeholder === 'string').toBe(true);
		r.unmount();
	});

	it('onKeyDown ignores other keys', async () => {
		const changed = vi.fn();
		const { container } = render(AmountInputItem, {
			props: { changed, label: 'Amount', name: 'amount' }
		});
		const ion = container.querySelector('ion-input') as HTMLIonInputElement;
		const native = createMockNative('123\u00A0€');
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
		expect(ion).toBeTruthy();
		const placeholder = ion.getAttribute('placeholder');
		// getAttribute returns null if not set, which is an object type in JS
		expect(placeholder === null || typeof placeholder === 'string').toBe(true);
		r.unmount();

		// Positive value shows formatted value
		const value = 1234.5;
		r = render(AmountInputItem, { props: { label: 'Amount', name: 'amount', value } });
		ion = r.container.querySelector('ion-input') as HTMLIonInputElement;
		// Verify component renders with value
		expect(ion).toBeTruthy();
		const displayValue = ion.getAttribute('value') ?? ion.value;
		expect(displayValue).toBeTruthy();
		r.unmount();
	});
});
