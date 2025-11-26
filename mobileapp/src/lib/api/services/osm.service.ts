import type { NominatimItemDto } from '$lib/api/dtos';
import type { AddressModel } from '$lib/models/osm';
import type { LatLng } from 'leaflet';

import { get } from 'svelte/store';

import { t } from '$lib/locales';
import { AlertType } from '$lib/models/ui';
import { showAlert } from '$lib/utility';

const $t = get(t);

class OsmResource {
	/** Fetches locations based on a query string using the Nominatim API.
	 * @param query The search query.
	 * @return {Promise<AddressModel[]>} The list of address models.
	 */
	async getLocationsByQuery(query: string): Promise<AddressModel[]> {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${query}&format=jsonv2&addressdetails=1&limit=5&countrycodes=DE&class=place&type=residential`
			);
			if (response.ok) {
				const result = (await response.json()) as NominatimItemDto[];
				return result.map((item) => this.getAddress(item)).filter((item) => !this.isEmptyAddress(item));
			} else {
				throw new Error('Failed to fetch locations');
			}
		} catch {
			await showAlert($t('components.widgets.map.api.error'), { type: AlertType.ERROR });
			return [];
		}
	}

	/** Fetches the location details based on latitude and longitude using the Nominatim API.
	 * @param latlng The latitude and longitude.
	 * @returns {Promise<AddressModel | undefined>} The address model or undefined if not found.
	 */
	async getLocationByLatLng(latlng: LatLng): Promise<AddressModel | undefined> {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
			);
			if (response.ok) {
				const result = (await response.json()) as NominatimItemDto;
				return this.getAddress(result);
			} else {
				await showAlert($t('components.widgets.map.api.location-error'), { type: AlertType.ERROR });
			}
		} catch {
			await showAlert($t('components.widgets.map.api.location-error'), { type: AlertType.ERROR });
		}
	}

	private getAddress(item: NominatimItemDto): AddressModel {
		const address = item.address;
		return {
			countryCode: address.country_code,
			latlng: { lat: Number.parseFloat(item.lat), lng: Number.parseFloat(item.lon) } as LatLng,
			locality: address.city ?? address.town ?? address.village ?? address.municipality,
			number: address.house_number,
			street: address.road,
			zip: address.postcode
		};
	}

	private isEmptyAddress(item: AddressModel): boolean {
		return !item.locality && !item.street && !item.number && !item.zip;
	}
}

export const osmService = new OsmResource();
