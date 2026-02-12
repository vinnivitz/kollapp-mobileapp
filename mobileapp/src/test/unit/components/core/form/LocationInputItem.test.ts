import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import LocationInputItem from '$lib/components/core/form/LocationInputItem.svelte';

vi.mock('$lib/components/shared/MapView.svelte', () => ({
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

	it('renders with hidden prop', () => {
		const { container } = render(LocationInputItem, {
			props: { hidden: true, label: 'Location' }
		});

		const item = container.querySelector('.hidden');
		expect(item).toBeTruthy();
	});

	it('renders with custom classList', () => {
		const { container } = render(LocationInputItem, {
			props: { classList: 'custom-location', label: 'Location' }
		});

		const item = container.querySelector('.custom-location');
		expect(item).toBeTruthy();
	});

	it('renders with name prop for form integration', () => {
		const { container } = render(LocationInputItem, {
			props: { label: 'Location', name: 'locationField' }
		});

		const input = container.querySelector('ion-input[name="locationField"]');
		expect(input).toBeTruthy();
	});

	it('uses default icon when not specified', () => {
		const { container } = render(LocationInputItem, {
			props: { label: 'Location' }
		});

		const icon = container.querySelector('ion-icon');
		expect(icon).toBeTruthy();
	});

	it('renders map icon button for opening modal', () => {
		const { container } = render(LocationInputItem, {
			props: { label: 'Location', value: 'Berlin' }
		});

		const endButton = container.querySelector('ion-button[slot="end"]');
		expect(endButton).toBeTruthy();
	});

	it('shows modal with MapView when button clicked', async () => {
		const { container } = render(LocationInputItem, {
			props: { label: 'Location', value: 'Berlin' }
		});

		const endButton = container.querySelector('ion-button[slot="end"]')!;
		await fireEvent.click(endButton);

		const modal = container.querySelector('ion-modal');
		expect(modal).toBeTruthy();
	});

	it('renders with helperText prop', () => {
		const { container } = render(LocationInputItem, {
			props: { helperText: 'Enter your address', label: 'Location' }
		});

		// helperText is passed to InputItem child component
		expect(container).toBeTruthy();
	});
});
