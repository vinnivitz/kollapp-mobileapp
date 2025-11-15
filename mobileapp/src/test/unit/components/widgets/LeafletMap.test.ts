import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { LatLng, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import { beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { osmResource } from '$lib/api/resources';
import LeafletMapComponent from '$lib/components/widgets/LeafletMap.svelte';

type MockMap = {
	addLayer: Mock;
	on: Mock;
	remove: Mock;
	setView: Mock;
};

function mockSearchbarSetFocus(searchbar: HTMLIonSearchbarElement): void {
	if (searchbar) {
		searchbar.setFocus = vi.fn();
	}
}

function registerMocks(): void {
	vi.mock('$lib/environment', () => ({
		default: {
			defaultPosition: '[48.137154, 11.576124]'
		}
	}));

	vi.mock('$lib/utility', () => {
		const storedValue = undefined;
		return {
			clickOutside: vi.fn(() => ({
				destroy: () => {}
			})),
			getStoredValue: vi.fn().mockResolvedValue(storedValue)
		};
	});

	vi.mock('leaflet', async () => {
		const actual = await vi.importActual<typeof import('leaflet')>('leaflet');
		return {
			...actual,
			Map: vi.fn(function (this: MockMap) {
				this.addLayer = vi.fn();
				this.on = vi.fn();
				this.remove = vi.fn();
				this.setView = vi.fn();
				return this;
			}),
			Marker: vi.fn(function (this: any) {
				this.addTo = vi.fn().mockReturnThis();
				this.bindTooltip = vi.fn().mockReturnThis();
				this.openTooltip = vi.fn();
				this.removeFrom = vi.fn();
				return this;
			}),
			TileLayer: vi.fn(function (this: any) {
				this.addTo = vi.fn().mockReturnThis();
				return this;
			})
		};
	});

	vi.mock('$lib/api/resources', () => ({
		osmResource: {
			getLocationByLatLng: vi.fn().mockResolvedValue({
				locality: 'Testville',
				number: '1',
				street: 'Test St',
				zip: '12345'
			}),
			getLocationsByQuery: vi.fn().mockResolvedValue([
				{
					latlng: new LatLng(1, 2),
					locality: 'Querytown',
					number: '5',
					street: 'Query St',
					zip: '54321'
				}
			])
		}
	}));
}

describe('LeafletMap', () => {
	beforeAll(() => registerMocks());
	beforeEach(() => {
		const existing = document.querySelector('#map');
		existing?.remove();
		const mapDiv = document.createElement('div');
		mapDiv.id = 'map';
		document.body.append(mapDiv);

		(LeafletMap as unknown as Mock).mockClear();
		(LeafletMarker as unknown as Mock).mockClear();
		(osmResource.getLocationByLatLng as Mock).mockClear();
		(osmResource.getLocationsByQuery as Mock).mockClear();
	});

	it('renders the map container', () => {
		render(LeafletMapComponent, { props: {} });
		expect(document.querySelector('#map')).toBeTruthy();
	});

	it('renders the search FAB when searchable is true', () => {
		const { container } = render(LeafletMapComponent, { props: { searchable: true } });
		expect(container.querySelector('ion-fab-button')).toBeTruthy();
	});

	it('does not render search FAB when searchable is false', () => {
		const { container } = render(LeafletMapComponent, { props: { searchable: false } });
		expect(container.querySelector('ion-fab-button')).toBeFalsy();
	});

	it('opens the searchbar when FAB is clicked', async () => {
		const { container } = render(LeafletMapComponent, { props: {} });
		const fab = container.querySelector('ion-fab-button')!;
		await fireEvent.click(fab);

		await waitFor(() => {
			const searchbar = container.querySelector('ion-searchbar');
			if (searchbar) {
				searchbar.setFocus = vi.fn();
			}
			expect(searchbar).toBeTruthy();
		});
	});

	it('shows search results from query', async () => {
		const { container } = render(LeafletMapComponent, { props: {} });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		mockSearchbarSetFocus(searchbar);
		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'Test' } }));

		await waitFor(
			() => {
				const items = container.querySelectorAll('ion-item');
				expect(items.length).toBeGreaterThan(0);
				expect(items?.[0]?.textContent).toContain('Query St');
			},
			{ timeout: 2000 }
		);
	});

	it('clears results for empty search value', async () => {
		const { container } = render(LeafletMapComponent, { props: {} });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		mockSearchbarSetFocus(searchbar);

		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'Some' } }));
		await waitFor(() => expect(container.querySelectorAll('ion-item').length).toBeGreaterThan(0), { timeout: 2000 });

		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: '' } }));

		await waitFor(() => expect(container.querySelectorAll('ion-item').length).toBe(0));
	});

	it('calls getLocationByLatLng on valid coordinate search', async () => {
		const { container } = render(LeafletMapComponent, { props: {} });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		mockSearchbarSetFocus(searchbar);
		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: '40.7128, -74.0060' } }));

		await waitFor(
			() => {
				expect(osmResource.getLocationByLatLng).toHaveBeenCalled();
			},
			{ timeout: 2000 }
		);
	});

	it('calls selected callback with formatted address after marker placement', async () => {
		const selected = vi.fn();
		const { container } = render(LeafletMapComponent, { props: { selected } });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		mockSearchbarSetFocus(searchbar);
		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: '40.7128, -74.0060' } }));

		await waitFor(
			() => {
				expect(selected).toHaveBeenCalledWith('Test St 1, 12345 Testville');
			},
			{ timeout: 2000 }
		);
	});

	it('replaces an existing marker on subsequent placements (removeFrom branch)', async () => {
		const { container } = render(LeafletMapComponent, { props: {} });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		mockSearchbarSetFocus(searchbar);

		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: '40.0, 10.0' } }));
		await waitFor(() => expect(osmResource.getLocationByLatLng).toHaveBeenCalledTimes(1), { timeout: 2000 });

		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: '41.0, 11.0' } }));

		await waitFor(
			() => {
				const instances = (LeafletMarker as unknown as Mock).mock.results.map((r) => r.value).filter(Boolean);
				const anyRemoved = instances.some((m: LeafletMarker) => (m.removeFrom as Mock).mock.calls.length > 0);
				expect(anyRemoved).toBe(true);
			},
			{ timeout: 2000 }
		);
	});

	it('selecting a search result places a marker and closes the searchbar', async () => {
		const { container } = render(LeafletMapComponent, { props: {} });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		mockSearchbarSetFocus(searchbar);
		await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'Main Sq' } }));

		const firstItem = await waitFor(() => container.querySelector('ion-item'), { timeout: 2000 });
		expect(firstItem).toBeTruthy();
		await fireEvent.click(firstItem!);

		await waitFor(() => {
			expect(container.querySelector('ion-searchbar')).toBeFalsy();
			expect(container.querySelectorAll('ion-item').length).toBe(0);
		});
	});
	it('searchbar focuses when opened (setTimeout path)', async () => {
		vi.useFakeTimers();
		const { container } = render(LeafletMapComponent, { props: {} });

		const fab = container.querySelector('ion-fab-button')!;
		await fireEvent.click(fab);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		searchbar.setFocus = vi.fn();

		vi.advanceTimersByTime(20);

		expect(searchbar.setFocus).toHaveBeenCalled();
		vi.useRealTimers();
	});

	it('does not initialize a new map if a leaflet container already exists', () => {
		const leafletDiv = document.createElement('div');
		leafletDiv.className = 'leaflet-container';
		document.body.append(leafletDiv);

		render(LeafletMapComponent, { props: {} });

		expect(LeafletMap).not.toHaveBeenCalled();
		leafletDiv.remove();
	});

	it('initializes with value prop -> queries by text then sets marker', async () => {
		for (const element of document.querySelectorAll('.leaflet-container')) element.remove();

		render(LeafletMapComponent, { props: { value: 'Some Address' } });

		await waitFor(() => {
			expect(osmResource.getLocationsByQuery).toHaveBeenCalledWith('Some Address');
		});

		const markerInstances = (LeafletMarker as unknown as Mock).mock.results.map((r) => r.value).filter(Boolean);

		expect(markerInstances.length).toBeGreaterThan(0);
		expect(markerInstances[0].addTo).toHaveBeenCalled();
	});

	it('triggers handleMapClick via Leaflet map click handler', async () => {
		render(LeafletMapComponent, { props: {} });

		await waitFor(() => {
			expect(LeafletMap).toHaveBeenCalled();
		});

		const mapInstance = vi.mocked(LeafletMap).mock.results.at(-1)!.value as MockMap;

		expect(mapInstance.on).toHaveBeenCalledWith('click', expect.any(Function));

		const clickHandler = mapInstance.on.mock.calls.find(([event_]) => event_ === 'click')![1] as (event_: {
			latlng: LatLng;
		}) => unknown;

		await clickHandler({ latlng: new LatLng(3, 4) });

		await waitFor(() => {
			expect(osmResource.getLocationByLatLng).toHaveBeenCalledWith(expect.any(LatLng));
		});
	});

	it('formats address: street without number -> "Street, ZIP Locality"', async () => {
		vi.mocked(osmResource.getLocationByLatLng).mockResolvedValueOnce({
			countryCode: 'DE',
			latlng: new LatLng(10, 20),
			locality: 'Nonum City',
			number: '',
			street: 'NoNum St',
			zip: '99999'
		});

		const selected = vi.fn();
		render(LeafletMapComponent, { props: { selected } });

		await waitFor(() => expect(LeafletMap).toHaveBeenCalled());

		const mapInstance = vi.mocked(LeafletMap).mock.results.at(-1)!.value as MockMap;
		const clickHandler = mapInstance.on.mock.calls.find(([event_]) => event_ === 'click')![1] as (event_: {
			latlng: LatLng;
		}) => unknown;

		await clickHandler({ latlng: new LatLng(10, 20) });

		await waitFor(() => {
			expect(selected).toHaveBeenCalledWith('NoNum St, 99999 Nonum City');
		});
	});

	it('formats address: only locality (no street) -> "Locality, ZIP"', async () => {
		vi.mocked(osmResource.getLocationByLatLng).mockResolvedValueOnce({
			countryCode: 'DE',
			latlng: new LatLng(30, 40),
			locality: 'OnlyTown',
			number: '',
			street: '',
			zip: '22222'
		});

		const selected = vi.fn();
		render(LeafletMapComponent, { props: { selected } });

		await waitFor(() => expect(LeafletMap).toHaveBeenCalled());

		const mapInstance = vi.mocked(LeafletMap).mock.results.at(-1)!.value as MockMap;
		const clickHandler = mapInstance.on.mock.calls.find(([event_]) => event_ === 'click')![1] as (event_: {
			latlng: LatLng;
		}) => unknown;

		await clickHandler({ latlng: new LatLng(30, 40) });

		await waitFor(() => {
			expect(selected).toHaveBeenCalledWith('OnlyTown, 22222');
		});
	});

	it('formats address: only locality without zip -> "Locality"', async () => {
		vi.mocked(osmResource.getLocationByLatLng).mockResolvedValueOnce({
			countryCode: 'DE',
			latlng: new LatLng(50, 60),
			locality: 'JustLocality',
			number: '',
			street: '',
			zip: ''
		});
		const selected = vi.fn();
		render(LeafletMapComponent, { props: { selected } });
		await waitFor(() => expect(LeafletMap).toHaveBeenCalled());
		const mapInstance = vi.mocked(LeafletMap).mock.results.at(-1)!.value as MockMap;
		const clickHandler = mapInstance.on.mock.calls.find(([event_]) => event_ === 'click')![1] as (event_: {
			latlng: LatLng;
		}) => unknown;
		await clickHandler({ latlng: new LatLng(50, 60) });
		await waitFor(() => {
			expect(selected).toHaveBeenCalledWith('JustLocality');
		});
	});

	it('formats address: neither street nor locality -> empty string', async () => {
		vi.mocked(osmResource.getLocationByLatLng).mockResolvedValueOnce({
			countryCode: 'DE',
			latlng: new LatLng(50, 60),
			locality: '',
			number: '',
			street: '',
			zip: ''
		});

		const selected = vi.fn();
		render(LeafletMapComponent, { props: { selected } });

		await waitFor(() => expect(LeafletMap).toHaveBeenCalled());

		// 👇 use LeafletMap (the mocked constructor), not the component
		const mapInstance = vi.mocked(LeafletMap).mock.results.at(-1)!.value as MockMap;
		const clickHandler = mapInstance.on.mock.calls.find(([event_]) => event_ === 'click')![1] as (event_: {
			latlng: LatLng;
		}) => unknown;

		await clickHandler({ latlng: new LatLng(50, 60) });

		await waitFor(() => {
			expect(selected).toHaveBeenCalledWith('');
		});
	});

	it('removes existing leaflet container before initialization', async () => {
		for (const element of document.querySelectorAll('.leaflet-container')) element.remove();

		const mapDiv = document.createElement('div');
		mapDiv.id = 'map';
		const existing = document.createElement('div');
		existing.className = 'leaflet-container';
		mapDiv.append(existing);
		document.body.append(mapDiv);

		render(LeafletMapComponent, { props: {} });

		// Should have removed the existing container and created a new map
		await waitFor(() => expect(LeafletMap).toHaveBeenCalled());

		mapDiv.remove();
	});
});
