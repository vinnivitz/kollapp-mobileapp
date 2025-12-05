<script lang="ts">
	import type { SegmentConfig } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	import Chip from './Chip.svelte';

	import FadeInOut from '$lib/components/layout/FadeInOut.svelte';

	type Properties = {
		config: SegmentConfig[];
		children?: Snippet;
		classList?: string;
	};

	let { children, classList, config }: Properties = $props();

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
<FadeInOut classList={`${classList} ${selectedClass}`}>{@render children?.()}</FadeInOut>
