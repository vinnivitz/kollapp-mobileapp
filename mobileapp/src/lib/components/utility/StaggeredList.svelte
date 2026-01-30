<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';

	type Properties = {
		/** The snippet to render for each item */
		children: Snippet<[item: T, index: number]>;
		/** The items to render in a staggered fashion */
		items: T[];
		/** Duration of each fade animation (in ms) */
		fadeDuration?: number;
		/** CSS class to apply to each item wrapper */
		itemClass?: string;
		/** Key function to get unique identifier for each item */
		getKey?: (item: T, index: number) => number;
	};

	let { children, fadeDuration = 100, getKey = (_, index) => index, itemClass = '', items }: Properties = $props();

	let shownKeys = $state(new Set<number>());
	let pendingKeys = $state<number[]>([]);
	let visibleKeys = $state(new Set<number>());
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const visibleItems = $derived(items.filter((item, index) => visibleKeys.has(getKey(item, index))));

	$effect(() => {
		const currentItems = items;

		untrack(() => {
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = undefined;
			}

			const currentKeys = new Set(currentItems.map((item, index) => getKey(item, index)));

			const removedKeys = [...shownKeys].filter((key) => !currentKeys.has(key));
			for (const key of removedKeys) {
				shownKeys.delete(key);
				visibleKeys.delete(key);
			}

			const newKeys: number[] = [];
			for (const [index, item] of currentItems.entries()) {
				const key = getKey(item, index);
				if (!shownKeys.has(key) && !pendingKeys.includes(key)) {
					newKeys.push(key);
				}
			}

			if (newKeys.length > 0) {
				for (const [index, item] of currentItems.entries()) {
					const key = getKey(item, index);
					if (shownKeys.has(key)) {
						visibleKeys.add(key);
					}
				}

				pendingKeys = [...pendingKeys, ...newKeys];
				scheduleNextPending();
			} else {
				visibleKeys = new SvelteSet(
					currentItems.map((item, index) => getKey(item, index)).filter((key) => shownKeys.has(key))
				);
			}
		});
	});

	function scheduleNextPending(): void {
		if (pendingKeys.length === 0) return;

		timeoutId = setTimeout(() => {
			const [nextKey, ...rest] = pendingKeys;
			pendingKeys = rest;
			if (nextKey !== undefined) {
				shownKeys.add(nextKey);
				visibleKeys = new SvelteSet([...visibleKeys, nextKey]);
			}
			scheduleNextPending();
		});
	}
</script>

{#each visibleItems as item, index (getKey(item, index))}
	{@const key = getKey(item, index)}
	{@const isNew = !shownKeys.has(key) || pendingKeys.includes(key)}
	<div class={itemClass} in:fade={{ duration: isNew ? fadeDuration : 0 }} out:fade={{ duration: fadeDuration }}>
		{@render children(item, index)}
	</div>
{/each}
