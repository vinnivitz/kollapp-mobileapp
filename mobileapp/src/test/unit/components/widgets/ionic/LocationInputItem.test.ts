import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';

vi.mock('$lib/components/widgets/LeafletMap.svelte', () => ({
	default: () => '<div id="leaflet" />'
}));

describe('widgets/ionic/LocationInputItem', () => {
	it('opens modal via input icon and can dismiss', async () => {
		const changed = vi.fn();
		const { container } = render(LocationInputItem, {
			props: { changed, helperText: 'h', label: 'Loc', value: '' }
		});
		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
		await fireEvent.click(endButton!);
		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();
		const dismissButton = container.querySelector('ion-buttons[slot="start"] ion-button');
		if (dismissButton) await fireEvent.click(dismissButton);
	});
});
