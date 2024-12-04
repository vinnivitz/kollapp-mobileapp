<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		onClick,
		shape,
		strong = true
	}: { children: Snippet; onClick: () => void; shape?: 'round'; strong?: boolean } = $props();
</script>

<ion-button {shape} onclick={onClick} {strong} role="button" onkeydown={onClick} tabindex="0">
	{@render children?.()}
</ion-button>
