<script lang="ts">
	import { goto } from '$app/navigation';

	import { PageRoute } from '$lib/models/routing';
	import { clickableElement, navigateBack } from '$lib/utils';

	let { title, showBackButton }: { title: string; showBackButton?: boolean } = $props();
</script>

<ion-header>
	<ion-toolbar color="primary">
		<ion-title>{title}</ion-title>

		<ion-buttons slot="start">
			<ion-button>
				{#if showBackButton}
					<ion-back-button default-href="/" use:clickableElement={async () => await navigateBack()}>
					</ion-back-button>
				{:else}
					<img
						use:clickableElement={() => goto(PageRoute.HOME)}
						src="/logo.png"
						alt="Logo"
						class="h-8 w-8"
					/>
				{/if}
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="end">
			<ion-menu-button class="text-3xl"></ion-menu-button>
		</ion-buttons>
	</ion-toolbar>
</ion-header>
