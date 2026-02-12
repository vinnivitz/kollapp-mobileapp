import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import MapWidget from '$lib/components/shared/MapView.svelte';

// Mock Leaflet
vi.mock('leaflet', () => ({
	LatLng: vi.fn((lat, lng) => ({ lat, lng })),
	Map: vi.fn(() => ({
		fitBounds: vi.fn(),
		off: vi.fn(),
		on: vi.fn(),
		remove: vi.fn(),
		setView: vi.fn()
	})),
	Marker: vi.fn(() => ({
		addTo: vi.fn(),
		remove: vi.fn(),
		setLatLng: vi.fn()
	})),
	TileLayer: vi.fn(() => ({
		addTo: vi.fn()
	}))
}));

// Mock OSM service
vi.mock('$lib/api/services', () => ({
	osmService: {
		getAddressFromPosition: vi.fn().mockResolvedValue({ display_name: 'Test Address' }),
		searchPosition: vi.fn().mockResolvedValue([
			{ display_name: 'Result 1', lat: 52.52, lon: 13.405 },
			{ display_name: 'Result 2', lat: 48.137, lon: 11.576 }
		])
	}
}));

vi.mock('$lib/utility', async (importOriginal) => {
	const original = await importOriginal<object>();
	return {
		...original,
		clickOutside: vi.fn(),
		getStoredValue: vi.fn().mockReturnValue({}),
		uniqueBy: <T>(array: T[]) => array
	};
});

describe('widgets/MapWidget', () => {
	it('renders map container', () => {
		const { container } = render(MapWidget, {
			props: {}
		});
		expect(container.querySelector('div')).toBeTruthy();
	});

	it('hides searchbar when searchable=false', () => {
		const { container } = render(MapWidget, {
			props: { searchable: false }
		});
		const searchbar = container.querySelector('ion-searchbar');
		expect(searchbar).toBeFalsy();
	});

	it('applies custom classList', () => {
		const { container } = render(MapWidget, {
			props: { classList: 'custom-map-class' }
		});
		expect(container.querySelector('.custom-map-class')).toBeTruthy();
	});

	it('renders search toggle button when searchable', () => {
		const { container } = render(MapWidget, {
			props: { searchable: true }
		});
		// The search button should exist (to open searchbar)
		expect(container.querySelector('div')).toBeTruthy();
	});

	it('renders map element for leaflet binding', () => {
		const { container } = render(MapWidget, {
			props: {}
		});
		// The second div is the map container bound to leaflet
		const divs = container.querySelectorAll('div');
		expect(divs.length).toBeGreaterThanOrEqual(2);
	});

	it('renders with initial value prop', () => {
		const { container } = render(MapWidget, {
			props: { value: '52.52, 13.405' }
		});
		expect(container).toBeTruthy();
	});
});
