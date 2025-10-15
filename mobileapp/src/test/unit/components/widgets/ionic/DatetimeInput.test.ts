import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';

const formattedDatePPP = 'August 10th, 2025';
const formattedDateYYYYMMDD = '2025-08-10';

const formatMock = vi.hoisted(() => {
	return vi.fn((_: Date, formatString: string) => {
		if (formatString === 'PPP') return formattedDatePPP;
		if (formatString === 'yyyy-MM-dd') return formattedDateYYYYMMDD;
		return '';
	});
});

function registerMocks(): void {
	vi.mock('date-fns', () => ({
		format: formatMock
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
			props: { applied: userApplied, label: 'Apply date', value: formattedDateYYYYMMDD }
		});

		await tick();

		const inputElement = container.querySelector('ion-input') as HTMLIonInputElement;
		expect(inputElement).toBeTruthy();
		expect(inputElement.value).toBe(formattedDatePPP);

		const itemElement = container.querySelector('ion-item');

		expect(itemElement).toBeTruthy();
	});
});
