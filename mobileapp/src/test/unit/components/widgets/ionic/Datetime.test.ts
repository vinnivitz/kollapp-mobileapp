import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Datetime from '$lib/components/widgets/ionic/Datetime.svelte';

describe('widgets/ionic/Datetime', () => {
	it('emits applied on ionChange and dismissed on blur', async () => {
		const applied = vi.fn();
		const dismissed = vi.fn();
		const { container } = render(Datetime, { props: { applied, dismissed, value: '2024-01-01' } });
		const dt = container.querySelector('ion-datetime')!;
		await fireEvent(dt, new CustomEvent('ionChange', { detail: { value: '2024-02-03' } }));
		expect(applied).toHaveBeenCalledWith('2024-02-03');
		await fireEvent.blur(dt);
		expect(dismissed).toHaveBeenCalled();
	});

	it('renders title slot when enabled', () => {
		const { container } = render(Datetime, { props: { showTitle: true } });
		const title = container.querySelector('span[slot="title"]');
		expect(title).toBeTruthy();
	});
});
