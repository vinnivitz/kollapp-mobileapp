<script lang="ts">
	import type { Snippet } from 'svelte';

	import { navigating } from '$app/stores';

	import Header from './Header.svelte';

	let {
		title,
		children,
		showLoginButton = true
	}: { title: string; children?: Snippet; showLoginButton?: boolean } = $props();

	let navigationDebounced = $state(false);
	let navigationTimeout: ReturnType<typeof setTimeout>;

	$effect(() => {
		if ($navigating) {
			navigationTimeout = setTimeout(() => (navigationDebounced = true), 100);
		}
	});

	$effect(() => {
		clearTimeout(navigationTimeout);
		navigationDebounced = false;
	});
</script>

<Header {title} {showLoginButton}></Header>
{#if $navigating && navigationDebounced}
	<ion-progress-bar type="indeterminate"></ion-progress-bar>
{/if}
<ion-content class="ion-padding">
	{@render children?.()}
</ion-content>
