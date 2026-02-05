import type { NominatimAddressItemTO } from '$lib/api/dtos';

/**
 * Data Transfer Object for Nominatim item information.
 */
export type NominatimItemDto = {
	address: NominatimAddressItemTO;
	lat: string;
	lon: string;
};
