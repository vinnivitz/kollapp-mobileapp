<script lang="ts">
	import { goto } from '$app/navigation';

	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models';
	import { clickableElement, navigateBack } from '$lib/utils';

	let {
		title,
		showLoginButton,
		showBackButton
	}: { title: string; showLoginButton?: boolean; showBackButton?: boolean } = $props();
</script>

<ion-header>
	<ion-toolbar>
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
						alt="User"
						class="h-8 w-8"
					/>
				{/if}
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="end" class="me-3">
			{#if showLoginButton}
				<ion-button
					color="primary"
					fill="outline"
					use:clickableElement={() => goto(PageRoute.AUTH_LOGIN)}
				>
					{$t('components.layout.header.button.login')}
				</ion-button>
			{/if}
		</ion-buttons>
	</ion-toolbar>
</ion-header>
