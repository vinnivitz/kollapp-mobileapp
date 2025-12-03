<script lang="ts">
	import type { Snippet } from 'svelte';

	import { fade } from 'svelte/transition';

	type Properties = {
		children: Snippet;
		classList?: string;
	};

	let { children, classList = '' }: Properties = $props();
</script>

<div class={classList} in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
	{@render children?.()}
</div>
