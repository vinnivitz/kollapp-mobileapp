import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';

vi.mock('$lib/utility', () => ({
	clickOutside: () => ({ destroy() {} })
}));

describe('Datetime Component', () => {
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

		const ionDatetime = container.querySelector('ion-datetime') as HTMLElement;
		await fireEvent.blur(ionDatetime);

		expect(dismissed).toHaveBeenCalledTimes(1);
	});

	it('calls applied callback with the new value on ionChange', async () => {
		const applied = vi.fn();
		const { container } = render(Datetime, {
			props: { applied }
		});

		const ionDatetime = container.querySelector('ion-datetime') as HTMLElement;
		const newValue = new Date().toISOString();

		await fireEvent(ionDatetime, new CustomEvent('ionChange', { detail: { value: newValue } }));

		expect(applied).toHaveBeenCalledWith(newValue);
	});
});
