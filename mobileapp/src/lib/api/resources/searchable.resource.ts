import type { SearchableItemDto } from '$lib/api/dto/server';

import { get } from 'svelte/store';

import { t } from '$lib/locales';
import { PageRoute } from '$lib/models/routing';
import { organizationStore, userStore } from '$lib/stores';

const $t = get(t);

/**
 * Filters searchable items based on a search term.
 * @param value The search term to filter searchable items.
 * @returns {Promise<SearchableItemDto[]>} A promise that resolves to an array of searchable items that match the search term.
 */
async function filter(value: string): Promise<SearchableItemDto[]> {
	const response = await fetch('/data/searchables.json');
	const items: SearchableItemDto[] = await response.json();
	const userRoles = get(userStore)?.roles;
	const organization = get(organizationStore);
	return items
		.filter((item: SearchableItemDto) => {
			const hasTerm = $t(item.label).toLowerCase().includes(value.toLowerCase());
			const validRole = item.accessible ? item.accessible.some((role) => userRoles?.includes(role)) : true;
			const accessible =
				item.route.startsWith(PageRoute.ORGANIZATION.ROOT) && !organization
					? item.route === PageRoute.ORGANIZATION.ROOT ||
						item.route === PageRoute.ORGANIZATION.REGISTER ||
						item.route === PageRoute.ORGANIZATION.JOIN
					: true;
			return hasTerm && validRole && accessible;
		})
		.map((item) => ({ ...item, label: $t(item.label) }));
}

export const searchableResource = {
	filter
};
