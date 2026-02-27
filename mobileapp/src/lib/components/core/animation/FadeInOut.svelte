<script lang="ts">
	import type { Snippet } from 'svelte';

	import { fade } from 'svelte/transition';

	type Properties = {
		children: Snippet;
		classList?: string;
		duration?: number;
	};

	let { children, classList = '', duration = 100 }: Properties = $props();
</script>

<div class={classList} in:fade={{ delay: 150, duration }} out:fade={{ delay: 0, duration }}>
	{@render children?.()}
</div>
