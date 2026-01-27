import type { NominatimItemDto } from '$lib/api/dto';
import type { AddressModel } from '$lib/models/osm';
import type { LatLng } from 'leaflet';

import { get } from 'svelte/store';

import { t } from '$lib/locales';
import { showAlert } from '$lib/utility';

const $t = get(t);

class OsmService {
	private get base(): string {
		return 'https://nominatim.openstreetmap.org';
	}

	/** Fetches locations based on a query string using the Nominatim API.
	 * @param query The search query.
	 * @return {Promise<AddressModel[]>} The list of address models.
	 */
	getLocationsByQuery = async (query: string): Promise<AddressModel[]> => {
		try {
			const encodedQuery = encodeURIComponent(query);
			const response = await fetch(
				`${this.base}/search?q=${encodedQuery}&format=jsonv2&addressdetails=1&limit=5&countrycodes=DE&class=place&type=residential`
			);
			if (response.ok) {
				const result = (await response.json()) as NominatimItemDto[];
				return result.map((item) => this.getAddress(item)).filter((item) => !this.isEmptyAddress(item));
			} else {
				await showAlert($t('api.services.osm.location-query-error'));
				return [];
			}
		} catch {
			await showAlert($t('api.services.osm.location-query-error'));
			return [];
		}
	};

	/** Fetches the location details based on latitude and longitude using the Nominatim API.
	 * @param latlng The latitude and longitude.
	 * @returns {Promise<AddressModel | undefined>} The address model or undefined if not found.
	 */
	getLocationByLatLng = async (latlng: LatLng): Promise<AddressModel | undefined> => {
		try {
			const response = await fetch(`${this.base}/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
			if (response.ok) {
				const result = (await response.json()) as NominatimItemDto;
				return this.getAddress(result);
			} else {
				await showAlert($t('api.services.osm.location-query-error'));
			}
		} catch {
			await showAlert($t('api.services.osm.location-query-error'));
		}
	};

	private getAddress = (item: NominatimItemDto): AddressModel => {
		const address = item.address;
		return {
			countryCode: address.country_code,
			latlng: { lat: Number.parseFloat(item.lat), lng: Number.parseFloat(item.lon) } as LatLng,
			locality: address.city ?? address.town ?? address.village ?? address.municipality,
			number: address.house_number,
			street: address.road,
			zip: address.postcode
		};
	};

	private isEmptyAddress = (item: AddressModel): boolean => {
		return !item.locality && !item.street && !item.number && !item.zip;
	};
}

export const osmService = new OsmService();
