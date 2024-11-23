<script lang="ts">
	import type { Snippet } from 'svelte';

	import type { TabConfig } from '$lib/models';

	let { children, tabs }: { children: Snippet; tabs: TabConfig[] } = $props();
</script>

<ion-tabs>
	{@render children?.()}

	<ion-tab-bar slot="bottom">
		{#each tabs as tab, index}
			<ion-tab-button tab={tab.tab} role="tab" tabindex={index}>
				<ion-label>{tab.label}</ion-label>
				<ion-icon icon={tab.icon}></ion-icon>
			</ion-tab-button>
		{/each}
	</ion-tab-bar>
</ion-tabs>
