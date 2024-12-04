<script lang="ts">
	import { goto } from '$app/navigation';

	import { PageRoute } from '$lib/models';
	import { clickableElement } from '$lib/utils/index';

	let { title, showLoginButton }: { title: string; showLoginButton?: boolean } = $props();
</script>

<ion-header>
	<ion-toolbar>
		<ion-title>{title}</ion-title>

		<ion-buttons slot="start">
			<ion-button>
				<img
					use:clickableElement={() => goto(PageRoute.HOME)}
					src="/favicon.png"
					alt="User"
					class="h-8 w-8"
				/>
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="end" class="me-3">
			{#if showLoginButton}
				<ion-button
					color="primary"
					fill="outline"
					use:clickableElement={() => goto(PageRoute.AUTH_LOGIN)}
				>
					Log in
				</ion-button>
			{/if}
		</ion-buttons>
	</ion-toolbar>
</ion-header>
