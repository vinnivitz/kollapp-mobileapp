import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { LatLng } from 'leaflet';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { osmResource } from '$lib/api/resources';
import MapWithSearch from '$lib/components/widgets/LeafletMap.svelte'; // adjust path

// Mock Leaflet globally
vi.mock('leaflet', async () => {
	const actual = await vi.importActual<typeof import('leaflet')>('leaflet');
	return {
		...actual,
		Map: vi.fn().mockImplementation(() => ({
			addLayer: vi.fn(),
			on: vi.fn(),
			remove: vi.fn(),
			setView: vi.fn()
		})),
		Marker: vi.fn().mockImplementation(() => ({
			addTo: vi.fn().mockReturnThis(),
			bindTooltip: vi.fn().mockReturnThis(),
			openTooltip: vi.fn(),
			removeFrom: vi.fn()
		}))
	};
});

// Mock osm resource
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

describe('LeafletMap', () => {
	beforeEach(() => {
		// Reset DOM for map div between tests
		const mapDiv = document.createElement('div');
		mapDiv.id = 'map';
		document.body.append(mapDiv);
	});

	it('renders the map container', () => {
		const { container } = render(MapWithSearch, { props: {} });
		expect(container.querySelector('#map')).toBeTruthy();
	});

	it('renders the search FAB when searchable is true', () => {
		const { container } = render(MapWithSearch, { props: { searchable: true } });
		expect(container.querySelector('ion-fab-button')).toBeTruthy();
	});

	it('does not render search FAB when searchable is false', () => {
		const { container } = render(MapWithSearch, { props: { searchable: false } });
		expect(container.querySelector('ion-fab-button')).toBeFalsy();
	});

	it('opens the searchbar when FAB is clicked', async () => {
		const { container } = render(MapWithSearch, { props: {} });
		const fab = container.querySelector('ion-fab-button')!;
		await fireEvent.click(fab);

		await waitFor(() => {
			expect(container.querySelector('ion-searchbar')).toBeTruthy();
		});
	});

	it('shows search results from query', async () => {
		const { container } = render(MapWithSearch, { props: {} });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;
		expect(searchbar).toBeTruthy();

		searchbar.value = 'Test';

		await fireEvent(searchbar, new CustomEvent('ionInput'));

		await waitFor(() => {
			const items = container.querySelectorAll('ion-item');
			expect(items.length).toBeGreaterThan(0);
			expect(items?.[0]?.textContent).toContain('Query St');
		});
	});

	it('calls getLocationByLatLng on valid coordinate search', async () => {
		const { container } = render(MapWithSearch, { props: {} });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;

		expect(searchbar).toBeTruthy();

		searchbar.value = '40.7128, -74.0060';

		await fireEvent(searchbar, new CustomEvent('ionInput'));

		await waitFor(() => {
			expect(osmResource.getLocationByLatLng).toHaveBeenCalled();
		});
	});

	it('calls selected callback with formatted address after marker placement', async () => {
		const selected = vi.fn();
		const { container } = render(MapWithSearch, { props: { selected } });
		await fireEvent.click(container.querySelector('ion-fab-button')!);

		const searchbar = container.querySelector('ion-searchbar') as HTMLIonSearchbarElement;

		expect(searchbar).toBeTruthy();

		searchbar.value = '40.7128, -74.0060';

		await fireEvent(searchbar, new CustomEvent('ionInput'));

		await waitFor(() => {
			expect(selected).toHaveBeenCalledWith('Test St 1, 12345 Testville');
		});
	});
});
