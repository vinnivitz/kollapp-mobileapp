<script lang="ts">
	import type { Snippet } from 'svelte';

	import { navigating } from '$app/stores';

	import IonHeader from './IonHeader.svelte';

	import type { PageRoute } from '$lib/models/routes.model';

	let { tab, title, children }: { tab: PageRoute; title: string; children: Snippet } = $props();
</script>

<ion-tab {tab}>
	<IonHeader {title}></IonHeader>
	{#if $navigating}
		<ion-progress-bar type="indeterminate"></ion-progress-bar>
	{/if}
	<ion-content class="ion-padding">
		{@render children?.()}
	</ion-content>
</ion-tab>
