<script lang="ts">
	import type { TabConfig } from '$lib/models/ui';

	import { onMount, type Snippet } from 'svelte';

	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';

	import { PageRoute } from '$lib/models/routing';

	type Properties = {
		tabs: TabConfig[];
		children?: Snippet;
	};

	let { children, tabs }: Properties = $props();

	let controller: HTMLIonTabsElement;
	let currentTabName = $state(page.route.id ?? PageRoute.HOME);

	$effect(() => {
		const pathname = navigating?.to?.route.id;
		if (pathname && pathname !== currentTabName) {
			currentTabName = pathname;
		}
	});

	onMount(() => controller.select(currentTabName));

	const onTabSelect = async (selectedTab: string): Promise<void> => {
		await goto(selectedTab);
		await controller.select(selectedTab);
	};
</script>

<ion-tabs bind:this={controller}>
	{@render children?.()}

	<ion-tab-bar slot="bottom">
		{#each tabs as tab, index (tab.tab)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<ion-tab-button
				tab={tab.tab}
				role="tab"
				tabindex={index}
				class:tab-selected={tab.tab === currentTabName}
				onclick={() => onTabSelect(tab.tab)}
			>
				<ion-label>{tab.label}</ion-label>
				<ion-icon icon={tab.icon}></ion-icon>
			</ion-tab-button>
		{/each}
	</ion-tab-bar>
</ion-tabs>
