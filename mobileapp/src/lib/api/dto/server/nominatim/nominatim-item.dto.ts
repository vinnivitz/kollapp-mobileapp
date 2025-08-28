import type { NominatimAddressDto } from '$lib/api/dto/server';

/**
 * Data Transfer Object for Nominatim item information.
 */
export type NominatimItemDto = {
	address: NominatimAddressDto;
	lat: string;
	lon: string;
};
