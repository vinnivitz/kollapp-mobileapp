import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';

const formattedDatePPP = 'August 10th, 2025';
const formattedDateYYYYMMDD = '2025-08-10';

const formatMock = vi.hoisted(() =>
	vi.fn((_: unknown, fmt: string) => {
		if (fmt === 'PPP') return formattedDatePPP;
		if (fmt === 'yyyy-MM-dd') return formattedDateYYYYMMDD;
		return '';
	})
);

const setPopoverMock = vi.hoisted(() => vi.fn());

function registerMocks(): void {
	vi.mock('date-fns', () => ({
		format: formatMock,
		parse: vi.fn(() => ({}))
	}));

	vi.mock('$lib/stores', () => ({
		globalPopoverStore: {
			datetimeInputItem: { set: setPopoverMock, subscribe: vi.fn() }
		}
	}));
}

describe('DatetimeInput Component', () => {
	beforeAll(() => registerMocks());
	it('should format and set initial value when `value` is provided', async () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'Start date', value: formattedDateYYYYMMDD }
		});
		await tick();
		const inputElement = container.querySelector('ion-input') as HTMLIonInputElement;
		expect(inputElement).toBeTruthy();
		expect(inputElement.value).toBe(formattedDatePPP);
	});

	it('invokes applied, updates input (PPP), and dispatches ionInput', async () => {
		const userApplied = vi.fn();

		const { container } = render(DatetimeInputItem, {
			props: { changed: userApplied, label: 'Apply date', value: formattedDateYYYYMMDD }
		});

		await tick();

		const inputElement = container.querySelector('ion-input') as HTMLIonInputElement;
		expect(inputElement).toBeTruthy();
		expect(inputElement.value).toBe(formattedDatePPP);

		const dispatchSpy = vi.spyOn(inputElement, 'dispatchEvent');

		const itemElement = container.querySelector('ion-item');
		expect(itemElement).toBeTruthy();
		await fireEvent.click(itemElement!);

		const lastCall = setPopoverMock.mock.calls.at(-1);
		expect(lastCall).toBeTruthy();
		const payload = lastCall![0] as { applied: (v: string) => void };
		payload.applied(formattedDateYYYYMMDD);

		expect(inputElement.value).toBe(formattedDatePPP);
		expect(userApplied).toHaveBeenCalledWith(formattedDateYYYYMMDD);
		expect(dispatchSpy).toHaveBeenCalled();
	});

	it('onOpenDatetimeModal sets popover with computed props and current value', async () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'Open modal', value: formattedDateYYYYMMDD }
		});
		await tick();
		const itemElement = container.querySelector('ion-item');
		expect(itemElement).toBeTruthy();
		await fireEvent.click(itemElement!);

		const call = setPopoverMock.mock.calls.at(-1);
		const payload = call?.[0] as Record<string, unknown>;
		expect(payload).toBeTruthy();
		expect(payload).toEqual(
			expect.objectContaining({ max: undefined, min: undefined, open: true, type: expect.any(String) })
		);
		expect(payload.value).toBe(formattedDateYYYYMMDD);
		expect(typeof payload.applied).toBe('function');
	});

	it('onOpenDatetimeModal sets value to undefined when input has no value', async () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'No initial value', name: 'startDate' }
		});
		await tick();

		const itemElement = container.querySelector('ion-item');
		expect(itemElement).toBeTruthy();
		await fireEvent.click(itemElement!);

		const call = setPopoverMock.mock.calls.at(-1);
		const payload = call?.[0] as Record<string, unknown>;
		expect(payload).toBeTruthy();
		expect(payload.value).toBeUndefined();
	});
});
