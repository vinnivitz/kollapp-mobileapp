import { get } from 'svelte/store';

import type { SearchableItemDto } from '$lib/api/dto/server';
import { t } from '$lib/locales';

const $t = get(t);

export async function filter(value: string): Promise<SearchableItemDto[]> {
	const response = await fetch('/data/searchables.json');
	const items: SearchableItemDto[] = await response.json();
	return items
		.filter((item: SearchableItemDto) => $t(item.label).toLowerCase().includes(value.toLowerCase()))
		.map((item) => ({ ...item, label: $t(item.label) }));
}
