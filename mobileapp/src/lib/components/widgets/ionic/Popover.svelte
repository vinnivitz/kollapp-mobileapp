<script lang="ts">
	import { type Snippet } from 'svelte';

	import { layoutStore } from '$lib/stores';

	type Properties = {
		children: Snippet;
		open: boolean | undefined;
		classList?: string;
		extended?: boolean;
		dismissed?: () => void;
	};

	let { children, classList = '', dismissed, extended, open }: Properties = $props();

	const extendedClass = $derived(extended ? `extended ${$layoutStore}` : '');
</script>

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover is-open={open} on:didDismiss={dismissed} class={`${extendedClass} ${classList}`}>
	{@render children()}
</ion-popover>

<style>
	.extended {
		--width: 94%;

		&.ios {
			--offset-x: 6px;
		}
	}
</style>
