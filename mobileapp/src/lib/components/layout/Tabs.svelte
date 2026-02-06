<script lang="ts">
	import type { TabConfig } from '$lib/models/ui';

	import { onMount, type Snippet } from 'svelte';

	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import type { RouteId } from '$app/types';

	import { TourStepId } from '$lib/models/ui';

	type Properties = {
		tabs: TabConfig[];
		children?: Snippet;
	};

	let { children, tabs }: Properties = $props();

	let controller: HTMLIonTabsElement;
	let currentTabName = $state<RouteId>(page.route.id ?? '/');

	$effect(() => {
		const pathname = navigating?.to?.route.id;
		if (pathname && pathname !== currentTabName) {
			currentTabName = pathname;
		}
	});

	onMount(() => controller.select(currentTabName));

	const onTabSelect = async (selectedTab: RouteId): Promise<void> => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(selectedTab);
		await controller.select(selectedTab);
	};

	function getTourId(tab: RouteId): string | undefined {
		if (tab === '/organization') return TourStepId.NAVIGATION.ORGANIZATION_TAB;
		if (tab === '/account') return TourStepId.NAVIGATION.ACCOUNT_TAB;
		return undefined;
	}
</script>

<ion-tabs bind:this={controller}>
	{@render children?.()}

	<ion-tab-bar slot="bottom">
		{#each tabs as tab, index (tab.tab)}
			<ion-tab-button
				tab={tab.tab}
				role="tab"
				tabindex={index}
				aria-label={tab.label}
				aria-selected={tab.tab === currentTabName}
				class:tab-selected={tab.tab === currentTabName}
				data-tour={getTourId(tab.tab)}
				onclick={() => onTabSelect(tab.tab)}
				onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && onTabSelect(tab.tab)}
			>
				<ion-label>{tab.label}</ion-label>
				<ion-icon icon={tab.icon} aria-hidden="true"></ion-icon>
			</ion-tab-button>
		{/each}
	</ion-tab-bar>
</ion-tabs>
