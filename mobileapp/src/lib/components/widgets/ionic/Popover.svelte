<script lang="ts">
	import { type Snippet } from 'svelte';

	type Properties = {
		children: Snippet;
		open: boolean | undefined;
		classList?: string;
		extended?: boolean;
		lazy?: boolean;
		dismissed?: () => void;
	};

	let { children, classList = '', dismissed, extended, lazy = false, open }: Properties = $props();
</script>

{#if (lazy && open) || !lazy}
	<ion-popover translucent size="cover" is-open={open} ondidDismiss={dismissed} class={classList} class:extended>
		{@render children()}
	</ion-popover>
{/if}

<style>
	.extended {
		--width: 95%;
	}
</style>
