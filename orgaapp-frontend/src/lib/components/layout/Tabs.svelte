<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	import { goto } from '$app/navigation';
	import { page, navigating } from '$app/stores';

	import { PageRoute, type TabConfig } from '$lib/models';

	let { tabs, children }: { tabs: TabConfig[]; children?: Snippet } = $props();

	let controller: HTMLIonTabsElement;
	let currentTabName = $state($page.route.id ?? PageRoute.HOME);

	$effect(() => {
		const pathname = $navigating?.to?.route.id;
		if (pathname && pathname !== currentTabName) {
			currentTabName = pathname;
		}
	});

	onMount(async () => await controller.select(currentTabName));

	const onTabSelect = async (selectedTab: string): Promise<void> => {
		await goto(selectedTab);
		await controller.select(selectedTab);
	};
</script>

<ion-tabs bind:this={controller}>
	{@render children?.()}

	<ion-tab-bar slot="bottom">
		{#each tabs as tab, index (tab.tab)}
			<ion-tab-button
				tab={tab.tab}
				role="tab"
				tabindex={index}
				class:tab-selected={tab.tab === currentTabName}
				onkeydown={() => {}}
				onclick={() => onTabSelect(tab.tab)}
			>
				<ion-label>{tab.label}</ion-label>
				<ion-icon icon={tab.icon}></ion-icon>
			</ion-tab-button>
		{/each}
	</ion-tab-bar>
</ion-tabs>
