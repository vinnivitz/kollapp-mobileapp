import type { LatLng } from 'leaflet';

/**
 * Represents a position item with geographical coordinates and a name.
 */
export type PositionItem = {
	icon: string;
	latlng: LatLng;
	name: string;
};
