/**
 * Data Transfer Object for Nominatim address information.
 */
export type NominatimAddressItemTO = {
	city: string;
	city_district: string;
	country: string;
	country_code: string;
	house_number: string;
	municipality: string;
	postcode: string;
	road: string;
	state: string;
	town: string;
	village: string;
};
