<script lang="ts">
	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { isAuthenticated } from '$lib/api/utils';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { clickableElement } from '$lib/utils';

	async function logout(): Promise<void> {
		await apiResources.auth.logout();
		await goto(PageRoute.HOME);
		location.reload();
	}
</script>

<ion-menu side="end" content-id="menu">
	<ion-header>
		<ion-toolbar>
			<ion-searchbar debounce={100} placeholder={$t('components.layout.menu.searchbar.placeholder')}
			></ion-searchbar>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding relative text-center">
		<div class="flex justify-center gap-2">
			{#await isAuthenticated() then authenticated}
				{#if authenticated}
					<ion-button fill="outline" use:clickableElement={() => logout()}>
						{$t('components.layout.header.button.logout')}
					</ion-button>
				{:else}
					<ion-button fill="outline" use:clickableElement={() => goto(PageRoute.AUTH.LOGIN)}>
						{$t('components.layout.header.button.login')}
					</ion-button>
					<ion-button fill="outline" use:clickableElement={() => goto(PageRoute.AUTH.REGISTER)}>
						{$t('components.layout.header.button.register')}
					</ion-button>
				{/if}
			{/await}
		</div>
		<hr class="my-3" />
		<div class="absolute bottom-2 left-0 right-0">
			<hr class="my-2" />
			<ion-text color="medium">Made with </ion-text>
			<ion-text class="text-red-600">&#10084;</ion-text>
			<ion-text color="medium"> from Dresden.</ion-text>
		</div>
	</ion-content>
</ion-menu>
