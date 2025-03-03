import { get } from 'svelte/store';

import type { SearchableItem } from '$lib/api/dto/server';
import { t } from '$lib/locales';

const $t = get(t);

export async function filter(value: string): Promise<SearchableItem[]> {
	const response = await fetch('/data/searchables.json');
	const items: SearchableItem[] = await response.json();
	return items
		.filter((item: SearchableItem) => $t(item.label).toLowerCase().includes(value.toLowerCase()))
		.map((item) => ({ ...item, label: $t(item.label) }));
}
