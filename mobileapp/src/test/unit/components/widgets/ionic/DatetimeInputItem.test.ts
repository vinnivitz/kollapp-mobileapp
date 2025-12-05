import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, type Mock } from 'vitest';

import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';

describe('widgets/ionic/DatetimeInputItem', () => {
	it('opens global popover store on click', async () => {
		const { container } = render(DatetimeInputItem, { props: { label: 'When' } });
		const item = container.querySelector('ion-item')!;
		await fireEvent.click(item);
		const globalWithMocks = globalThis as unknown as { __mocks?: { datetimeInputSet?: Mock } };
		const set = globalWithMocks.__mocks?.datetimeInputSet;
		expect(set).toHaveBeenCalled();
	});
	it('dispatches customChange when name is set via applied callback', async () => {
		const { container } = render(DatetimeInputItem, { props: { label: 'When', name: 'when' } });
		const hostDiv = container.querySelector('div') as HTMLDivElement;
		type ChangeDetail = { key: string; value: string };
		const events: CustomEvent<ChangeDetail>[] = [];
		hostDiv.addEventListener('customChange', ((_event: Event) =>
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
});
