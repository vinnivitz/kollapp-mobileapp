import type { NominatimAddressDto } from '..';

/**
 * Data Transfer Object for Nominatim item information.
 */
export type NominatimItemDto = {
	address: NominatimAddressDto;
	lat: string;
	lon: string;
};
