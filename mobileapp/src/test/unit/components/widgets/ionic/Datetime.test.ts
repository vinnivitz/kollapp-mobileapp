import { TZDate } from '@date-fns/tz';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';

function registerMocks(): void {
	vi.mock('$lib/utility', () => ({
		clickOutside: () => ({ destroy() {} })
	}));
}

describe('Datetime Component', () => {
	beforeAll(() => registerMocks());
	it('renders with title when showTitle is true', () => {
		const { container } = render(Datetime, {
			props: { showTitle: true }
		});

		const titleSlot = container.querySelector('ion-datetime span[slot="title"]');
		expect(titleSlot).toBeTruthy();
	});

	it('calls dismissed callback on blur', async () => {
		const dismissed = vi.fn();
		const { container } = render(Datetime, {
			props: { dismissed }
		});

		const ionDatetime = container.querySelector('ion-datetime') as HTMLIonDatetimeElement;
		await fireEvent.blur(ionDatetime);

		expect(dismissed).toHaveBeenCalledTimes(1);
	});

	it('calls applied callback with the new value on ionChange', async () => {
		const applied = vi.fn();
		const { container } = render(Datetime, {
			props: { applied }
		});

		const ionDatetime = container.querySelector('ion-datetime') as HTMLIonDatetimeElement;
		const newValue = new TZDate().toISOString();

		await fireEvent(ionDatetime, new CustomEvent('ionChange', { detail: { value: newValue } }));

		expect(applied).toHaveBeenCalledWith(newValue);
	});
});
