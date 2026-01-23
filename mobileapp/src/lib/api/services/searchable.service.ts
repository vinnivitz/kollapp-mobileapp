import type { SearchableItemTO } from '$lib/api/dto';

import { get } from 'svelte/store';

import type { RouteId } from '$app/types';

import { t } from '$lib/locales';
import { organizationStore } from '$lib/stores';
import { hasOrganizationRole } from '$lib/utility';

const $t = get(t);

class SearchableService {
	/** Filters searchable items based on a search term.
	 * @param value The search term.
	 * @returns {Promise<SearchableItemTO[]>} The filtered searchable items.
	 */
	async filter(value: string): Promise<SearchableItemTO[]> {
		try {
			const response = await fetch('/data/searchables.json');
			const items: SearchableItemTO[] = await response.json();
			const organization = get(organizationStore);
			return items
				.filter((item: SearchableItemTO) => {
					const hasTerm = $t(item.label).toLowerCase().includes(value.toLowerCase());
					const validRole = item.accessible ? hasOrganizationRole(item.accessible) : true;
					const accessible =
						!!organization ||
						item.route === '/organization/join' ||
						item.route === '/organization/register' ||
						item.route.startsWith('/account' as RouteId);
					return hasTerm && validRole && accessible;
				})
				.map((item) => ({ ...item, label: $t(item.label) }));
		} catch {
			return [];
		}
	}
}

export const searchableService = new SearchableService();
