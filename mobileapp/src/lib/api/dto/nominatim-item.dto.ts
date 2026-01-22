import type { NominatimAddressItemTO } from '$lib/api/dto';

/**
 * Data Transfer Object for Nominatim item information.
 */
export type NominatimItemDto = {
	address: NominatimAddressItemTO;
	lat: string;
	lon: string;
};
