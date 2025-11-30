<script lang="ts">
	import type { SegmentConfig } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	import { fade } from 'svelte/transition';

	import Chip from './Chip.svelte';

	let { children, classList, config }: { children: Snippet; config: SegmentConfig[]; classList?: string } = $props();

	const selectedClass = $derived(config.find((item) => item.selected)?.class ?? '');
</script>

<div class="text-center">
	<div class="mb-2 flex items-center justify-center gap-3 rounded-full bg-(--ion-background-color-step-50) px-5 py-1">
		{#each config as item (item.label)}
			<Chip
				color={item.color ?? 'primary'}
				label={item.label}
				icon={item.icon}
				selected={item.selected}
				clicked={item.clicked}
			/>
		{/each}
	</div>
</div>
<div
	class={`${classList} ${selectedClass}`}
	in:fade={{ delay: 150, duration: 100 }}
	out:fade={{ delay: 0, duration: 100 }}
>
	{@render children?.()}
</div>
