import type { NominatimAddressItemDto } from '$lib/api/dtos';

/**
 * Data Transfer Object for Nominatim item information.
 */
export type NominatimItemDto = {
	address: NominatimAddressItemDto;
	lat: string;
	lon: string;
};
