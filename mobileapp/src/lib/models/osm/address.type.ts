import type { LatLng } from 'leaflet';

/**
 * Model representing an address with geographical coordinates.
 */
export type AddressModel = {
	countryCode: string;
	latlng: LatLng;
	locality: string;
	number: string;
	street: string;
	zip: string;
};
