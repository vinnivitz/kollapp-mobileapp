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
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-popover translucent size="cover" is-open={open} on:didDismiss={dismissed} class={classList} class:extended>
		{@render children()}
	</ion-popover>
{/if}

<style>
	.extended {
		--width: 95%;
	}
</style>
