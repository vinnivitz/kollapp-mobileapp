import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { Map } from 'leaflet';
import { describe, expect, it, vi } from 'vitest';

import LeafletMap from '$lib/components/widgets/LeafletMap.svelte';

vi.mock('leaflet', () => {
	class LatLng {
		constructor(
			public lat: number,
			public lng: number
		) {}
	}
	class Map {
		constructor(_element: HTMLElement, _options: unknown) {}
		on(): void {}
		off(): void {}
		remove(): void {}
		setView(_latlng: LatLng, _zoom: number): void {}
	}
	class Marker {
		constructor(_latlng: LatLng) {}
		addTo(): this {
			return this;
		}
		removeFrom(): void {}
		bindTooltip(): this {
			return this;
		}
		openTooltip(): this {
			return this;
		}
	}
	class TileLayer {
		constructor(_url: string, _options: unknown) {}
		addTo(): void {}
	}
	return { LatLng, Map, Marker, TileLayer };
});

vi.mock('$lib/api/services', () => ({
	osmService: {
		getLocationByLatLng: vi.fn().mockResolvedValue({ locality: 'Town', number: '1', street: 'Main', zip: '12345' }),
		getLocationsByQuery: vi
			.fn()
			.mockResolvedValue([
				{ latlng: { lat: 12.34, lng: 56.78 }, locality: 'Town', number: '1', street: 'Main', zip: '12345' }
			])
	}
}));
vi.mock('$lib/environment', () => ({ default: {}, defaultPosition: '[48.0, 9.0]' }));
vi.mock('$lib/utility', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/utility')>();
	return {
		...actual,
		getStoredValue: vi.fn().mockResolvedValue([48, 9])
	};
});

describe('widgets/LeafletMap (integrated)', () => {
	it('coordinate input sets marker via setView', async () => {
		const spy = vi.spyOn(Map.prototype, 'setView');

		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: true });
		vi.runAllTimers();
		await fireEvent.click(container.querySelector('ion-fab-button')!);
		const searchbar = (await waitFor(() => container.querySelector('ion-searchbar'))) as HTMLIonSearchbarElement;

		const detail = { value: '12.34,56.78' } as { value: string };
		const event_ = new CustomEvent('ionInput', { detail } as CustomEventInit);
		Object.defineProperty(event_, 'detail', { value: detail });
		searchbar.dispatchEvent(event_);

		vi.runAllTimers();

		await waitFor(() => expect(spy).toHaveBeenCalled());
	});

	it('value prop triggers updateMarkerFromValue', async () => {
		const { Marker } = await import('leaflet');
		const spyAddTo = vi.spyOn(Marker.prototype, 'addTo');
		vi.useFakeTimers();
		const { container, rerender } = render(LeafletMap, { searchable: true, value: '' });

		vi.runAllTimers();
		await waitFor(() => container.querySelector('div.absolute'));

		await rerender({ searchable: true, value: 'Main' });
		vi.runAllTimers();

		await waitFor(() => expect(spyAddTo).toHaveBeenCalled());
	});
});
