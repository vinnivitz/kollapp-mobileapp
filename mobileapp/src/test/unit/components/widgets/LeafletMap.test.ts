import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { Map, Marker } from 'leaflet';
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
vi.mock('$lib/environment', () => ({ default: { defaultPosition: '[48.0, 9.0]' }, defaultPosition: '[48.0, 9.0]' }));
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
		vi.useRealTimers();
	});

	it('value prop triggers updateMarkerFromValue', async () => {
		const spyAddTo = vi.spyOn(Marker.prototype, 'addTo');
		vi.useFakeTimers();
		const { container, rerender } = render(LeafletMap, { searchable: true, value: '' });

		vi.runAllTimers();
		await waitFor(() => container.querySelector('div.absolute'));

		await rerender({ searchable: true, value: 'Main' });
		vi.runAllTimers();

		await waitFor(() => expect(spyAddTo).toHaveBeenCalled());
		vi.useRealTimers();
	});

	it('renders without searchable prop', () => {
		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: false });
		vi.runAllTimers();
		expect(container.querySelector('ion-fab-button')).toBeFalsy();
		vi.useRealTimers();
	});

	it('opens searchbar on fab button click', async () => {
		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: true });
		vi.runAllTimers();

		const fabButton = container.querySelector('ion-fab-button');
		expect(fabButton).toBeTruthy();

		await fireEvent.click(fabButton!);
		vi.runAllTimers();

		await waitFor(() => {
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});
		vi.useRealTimers();
	});

	it('opens searchbar on Enter key press', async () => {
		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: true });
		vi.runAllTimers();

		const fabButton = container.querySelector('ion-fab-button');
		await fireEvent.keyDown(fabButton!, { key: 'Enter' });
		vi.runAllTimers();

		await waitFor(() => {
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});
		vi.useRealTimers();
	});

	it('shows search results and allows selection', async () => {
		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: true });
		vi.runAllTimers();

		await fireEvent.click(container.querySelector('ion-fab-button')!);
		vi.runAllTimers();

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		searchbar.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 'Main Street' } }));
		vi.runAllTimers();

		await waitFor(() => {
			const items = container.querySelectorAll('ion-item');
			expect(items.length).toBeGreaterThan(0);
		});
		vi.useRealTimers();
	});

	it('selects search item on click', async () => {
		const spySetView = vi.spyOn(Map.prototype, 'setView');
		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: true });
		vi.runAllTimers();

		await fireEvent.click(container.querySelector('ion-fab-button')!);
		vi.runAllTimers();

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		searchbar.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 'Main Street' } }));
		vi.runAllTimers();

		await waitFor(() => {
			const item = container.querySelector('ion-item');
			expect(item).toBeTruthy();
		});

		const item = container.querySelector('ion-item');
		await fireEvent.click(item!);
		vi.runAllTimers();

		await waitFor(() => expect(spySetView).toHaveBeenCalled());
		vi.useRealTimers();
	});

	it('selects search item on Enter key', async () => {
		const spySetView = vi.spyOn(Map.prototype, 'setView');
		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: true });
		vi.runAllTimers();

		await fireEvent.click(container.querySelector('ion-fab-button')!);
		vi.runAllTimers();

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		searchbar.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 'Main Street' } }));
		vi.runAllTimers();

		await waitFor(() => {
			const item = container.querySelector('ion-item');
			expect(item).toBeTruthy();
		});

		const item = container.querySelector('ion-item');
		await fireEvent.keyDown(item!, { key: 'Enter' });
		vi.runAllTimers();

		await waitFor(() => expect(spySetView).toHaveBeenCalled());
		vi.useRealTimers();
	});

	it('clears search results when query is empty', async () => {
		vi.useFakeTimers();
		const { container } = render(LeafletMap, { searchable: true });
		vi.runAllTimers();

		await fireEvent.click(container.querySelector('ion-fab-button')!);
		vi.runAllTimers();

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		searchbar.dispatchEvent(new CustomEvent('ionInput', { detail: { value: 'Main Street' } }));
		vi.runAllTimers();

		await waitFor(() => {
			expect(container.querySelectorAll('ion-item').length).toBeGreaterThan(0);
		});

		searchbar.dispatchEvent(new CustomEvent('ionInput', { detail: { value: '' } }));
		vi.runAllTimers();

		await waitFor(() => {
			expect(container.querySelectorAll('ion-item').length).toBe(0);
		});
		vi.useRealTimers();
	});

	it('calls selected callback when marker is set', async () => {
		const selectedMock = vi.fn();
		vi.useFakeTimers();
		const { container, rerender } = render(LeafletMap, {
			searchable: true,
			selected: selectedMock,
			value: ''
		});

		vi.runAllTimers();
		await waitFor(() => container.querySelector('div.absolute'));

		await rerender({ searchable: true, selected: selectedMock, value: 'Main' });
		vi.runAllTimers();

		await waitFor(() => expect(selectedMock).toHaveBeenCalled());
		vi.useRealTimers();
	});

	it('applies custom classList', () => {
		vi.useFakeTimers();
		const { container } = render(LeafletMap, {
			classList: 'custom-class',
			searchable: true
		});
		vi.runAllTimers();

		const wrapper = container.querySelector('div.relative');
		expect(wrapper?.className).toContain('custom-class');
		vi.useRealTimers();
	});
});
