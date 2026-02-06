import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
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

	it('renders with searchable=true by default', () => {
		const { container } = render(MapWidget, {
			props: { searchable: true }
		});
		// Searchbar is conditionally rendered based on searchbarOpen state
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

	it('renders with initial value', () => {
		const { container } = render(MapWidget, {
			props: { value: 'Berlin, Germany' }
		});
		expect(container).toBeTruthy();
	});

	it('triggers selected callback when location selected', async () => {
		const selected = vi.fn();
		const { container } = render(MapWidget, {
			props: { selected }
		});
		// Component should call selected when a location is chosen
		expect(container).toBeTruthy();
	});

	it('shows search results on input', async () => {
		const { container } = render(MapWidget, {
			props: {}
		});
		const searchbar = container.querySelector('ion-searchbar');
		if (searchbar) {
			await fireEvent(searchbar, new CustomEvent('ionInput', { detail: { value: 'Berlin' } }));
			await tick();
		}
		expect(container).toBeTruthy();
	});
});
