<script lang="ts">
	import type { SegmentConfig } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	import { FadeInOut } from '$lib/components/core/animation';
	import { Chip } from '$lib/components/core/display';

	type Properties = {
		config: SegmentConfig[];
		children?: Snippet;
		classList?: string;
		tourId?: string;
	};

	let { children, classList, config, tourId }: Properties = $props();

	const selectedClass = $derived(config.find((item) => item.selected)?.class ?? '');
</script>

<div class="sticky top-0 right-0 left-0 z-10 text-center" data-tour={tourId}>
	<div class="mb-2 flex items-center justify-center gap-3 rounded-full bg-(--ion-background-color-step-50) px-5 py-1">
		{#each config as item (item.label)}
			<Chip
				color={item.color ?? 'secondary'}
				label={item.label}
				icon={item.icon}
				selected={item.selected}
				clicked={item.clicked}
			/>
		{/each}
	</div>
</div>
<FadeInOut classList={`${classList} ${selectedClass}`}>{@render children?.()}</FadeInOut>
