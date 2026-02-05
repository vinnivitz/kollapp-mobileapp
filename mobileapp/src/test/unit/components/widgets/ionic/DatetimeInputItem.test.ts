import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
import { DateTimePickerType } from '$lib/models/ui';

describe('widgets/ionic/DatetimeInputItem', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});
	it('opens global popover store on click', async () => {
		const { container } = render(DatetimeInputItem, { props: { label: 'When' } });
		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);
		const globalWithMocks = globalThis as unknown as { __mocks?: { datetimeInputSet?: Mock } };
		const set = globalWithMocks.__mocks?.datetimeInputSet;
		expect(set).toHaveBeenCalled();
	});

	it('dispatches ionInput when name is set via applied callback', async () => {
		const { container } = render(DatetimeInputItem, { props: { label: 'When', name: 'when' } });
		const hostDiv = container.querySelector('div') as HTMLDivElement;
		type ChangeDetail = { key: string; value: string };
		const events: CustomEvent<ChangeDetail>[] = [];
		hostDiv.addEventListener('ionInput', ((_event: Event) =>
			events.push(_event as CustomEvent<ChangeDetail>)) as EventListener);

		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);

		const globalWithMocks = globalThis as unknown as { __mocks?: { datetimeInputSet?: Mock } };
		const set = globalWithMocks.__mocks?.datetimeInputSet as Mock | undefined;
		expect(set).toBeTruthy();
		const lastCall = set!.mock.calls.at(-1);
		const argument = lastCall?.[0] as { applied: (value: string) => void } | undefined;
		expect(argument).toBeTruthy();
		argument!.applied('2025-01-02');

		expect(events.length).toBe(1);
		expect(events[0]!.detail).toEqual({ key: 'when', value: '2025-01-02' });
	});

	it('displays formatted date value', async () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'Start Date', value: '2025-06-15' }
		});

		const displayText = container.querySelector('ion-text:last-child');
		// The format 'PPP' would show something like "June 15th, 2025"
		expect(displayText?.textContent).toContain('2025');
	});

	it('displays empty string when no value', () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'Optional Date' }
		});

		const displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent?.trim()).toBe('');
	});

	it('calls changed callback when no name prop', async () => {
		const changedFunction = vi.fn();
		const { container } = render(DatetimeInputItem, {
			props: { changed: changedFunction, label: 'When' }
		});

		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);

		const globalWithMocks = globalThis as unknown as { __mocks?: { datetimeInputSet?: Mock } };
		const set = globalWithMocks.__mocks?.datetimeInputSet as Mock | undefined;
		const lastCall = set!.mock.calls.at(-1);
		const argument = lastCall?.[0] as { applied: (value: string) => void } | undefined;
		argument!.applied('2025-03-20');

		expect(changedFunction).toHaveBeenCalledWith('2025-03-20');
	});

	it('renders with hidden prop', () => {
		const { container } = render(DatetimeInputItem, {
			props: { hidden: true, label: 'Hidden Date' }
		});

		const div = container.querySelector('div.hidden');
		expect(div).toBeTruthy();
	});

	it('renders with data-name attribute when name is provided', () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'Date', name: 'dateField' }
		});

		const divWithName = container.querySelector('div[data-name="dateField"]');
		expect(divWithName).toBeTruthy();
	});

	it('passes min and max to the datetime popover', async () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'Date Range', max: '2025-12-31', min: '2025-01-01' }
		});

		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);

		const globalWithMocks = globalThis as unknown as { __mocks?: { datetimeInputSet?: Mock } };
		const set = globalWithMocks.__mocks?.datetimeInputSet as Mock | undefined;
		const lastCall = set!.mock.calls.at(-1);
		const argument = lastCall?.[0] as { max?: string; min?: string } | undefined;

		expect(argument?.min).toBe('2025-01-01');
		expect(argument?.max).toBe('2025-12-31');
	});

	it('passes type to the datetime popover', async () => {
		const { container } = render(DatetimeInputItem, {
			props: { label: 'Time', type: DateTimePickerType.TIME }
		});

		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);

		const globalWithMocks = globalThis as unknown as { __mocks?: { datetimeInputSet?: Mock } };
		const set = globalWithMocks.__mocks?.datetimeInputSet as Mock | undefined;
		const lastCall = set!.mock.calls.at(-1);
		const argument = lastCall?.[0] as { type?: string } | undefined;

		expect(argument?.type).toBe(DateTimePickerType.TIME);
	});

	it('updates display value when value prop changes', async () => {
		const { container, rerender } = render(DatetimeInputItem, {
			props: { label: 'Date', value: '2025-01-15' }
		});

		let displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent).toContain('2025');

		rerender({ label: 'Date', value: '2026-06-20' });
		await vi.advanceTimersByTimeAsync(10);

		displayText = container.querySelectorAll('ion-text')[1];
		expect(displayText?.textContent).toContain('2026');
	});

	it('renders with custom icon', () => {
		const { container } = render(DatetimeInputItem, {
			props: { icon: 'calendar', label: 'Date' }
		});

		const icon = container.querySelector('ion-icon');
		expect(icon).toBeTruthy();
	});

	it('renders with classList', () => {
		const { container } = render(DatetimeInputItem, {
			props: { classList: 'custom-datetime', label: 'Date' }
		});

		const item = container.querySelector('ion-item.custom-datetime');
		expect(item).toBeTruthy();
	});
});
