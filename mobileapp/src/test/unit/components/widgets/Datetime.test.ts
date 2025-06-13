import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';

describe('Datetime Component', () => {
	it('renders with title when showTitle is true', () => {
		const { container } = render(Datetime, {
			props: { showTitle: true }
		});

		const ionDatetime = container.querySelector('ion-datetime') as HTMLIonDatetimeElement;
		ionDatetime.reset = vi.fn();

		const titleSlot = container.querySelector('ion-datetime span[slot="title"]');
		expect(titleSlot).toBeTruthy();
	});

	it('calls dismiss callback on blur (onDismiss)', async () => {
		const dismissMock = vi.fn();
		const { container } = render(Datetime, {
			props: { dismiss: dismissMock }
		});

		const ionDatetime = container.querySelector('ion-datetime') as HTMLIonDatetimeElement;
		ionDatetime.reset = vi.fn();

		await fireEvent.blur(ionDatetime);

		expect(ionDatetime.reset).toHaveBeenCalled();
		expect(dismissMock).toHaveBeenCalled();
	});

	it('calls apply callback on ionChange event (onApply)', async () => {
		const applyMock = vi.fn();
		const { container } = render(Datetime, {
			props: { apply: applyMock }
		});
		const ionDatetime = container.querySelector('ion-datetime') as HTMLIonDatetimeElement;
		ionDatetime.reset = vi.fn();
		const newValue = new Date().toISOString();
		const event = new CustomEvent('ionChange', {
			detail: { value: newValue }
		});

		await fireEvent(ionDatetime, event);

		expect(ionDatetime.reset).toHaveBeenCalled();
		expect(applyMock).toHaveBeenCalledWith(newValue);
	});
});
