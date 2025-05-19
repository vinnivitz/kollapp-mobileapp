import type { LatLng } from 'leaflet';

export type AddressModel = {
	countryCode: string;
	latlng: LatLng;
	locality: string;
	number: string;
	street: string;
	zip: string;
};
