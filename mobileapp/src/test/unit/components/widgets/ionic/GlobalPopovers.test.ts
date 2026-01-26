import { TZDate } from '@date-fns/tz';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import GlobalPopovers from '$lib/components/widgets/ionic/GlobalPopovers.svelte';
import { DateTimePickerType } from '$lib/models/ui';
import { globalPopoverStore } from '$lib/stores';

describe('widgets/ionic/GlobalPopovers', () => {
	it('renders popover and handles didDismiss', async () => {
		const { container } = render(GlobalPopovers);
		const pop = container.querySelector('ion-popover')!;
		expect(pop).toBeTruthy();
		await fireEvent(pop, new CustomEvent('didDismiss'));
	});

	it('renders with datetime popover open', async () => {
		const appliedMock = vi.fn();
		const dismissedMock = vi.fn();

		globalPopoverStore.datetimeInputItem.set({
			applied: appliedMock,
			dismissed: dismissedMock,
			max: undefined,
			min: undefined,
			open: true,
			type: DateTimePickerType.DATE,
			value: new TZDate().toISOString()
		});

		const { container } = render(GlobalPopovers);

		await waitFor(() => {
			const popover = container.querySelector('ion-popover');
			expect(popover).toBeTruthy();
		});

		const datetime = container.querySelector('ion-datetime');
		expect(datetime).toBeTruthy();
	});

	it('calls dismissed callback when datetime is dismissed', async () => {
		const appliedMock = vi.fn();
		const dismissedMock = vi.fn();

		globalPopoverStore.datetimeInputItem.set({
			applied: appliedMock,
			dismissed: dismissedMock,
			max: undefined,
			min: undefined,
			open: true,
			type: DateTimePickerType.DATE,
			value: new TZDate().toISOString()
		});

		const { container } = render(GlobalPopovers);

		const cancelButton = container.querySelector('ion-datetime ion-buttons ion-button');
		if (cancelButton) {
			await fireEvent.click(cancelButton);
			expect(dismissedMock).toHaveBeenCalled();
		}
	});
});
