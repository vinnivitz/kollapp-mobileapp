import type { NominatimAddressDto } from '.';

export type NominatimItemDto = {
	address: NominatimAddressDto;
	lat: string;
	lon: string;
};
