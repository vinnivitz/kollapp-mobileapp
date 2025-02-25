<script lang="ts">
	import { logInOutline, logOutOutline, personAddOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import { isAuthenticated } from '$lib/api/utils';
	import Button from '$lib/components/widgets/Button.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore, userStore } from '$lib/store';

	async function logout(): Promise<void> {
		apiResources.auth.logout();
		organizationStore.reset();
		userStore.reset();
		await goto(PageRoute.AUTH.LOGIN);
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
					<Button size="small" fill="outline" click={() => logout()} iconSrc={logOutOutline}>
						{$t('components.layout.header.button.logout')}
					</Button>
				{:else}
					<Button
						size="small"
						fill="outline"
						click={() => goto(PageRoute.AUTH.LOGIN)}
						iconSrc={logInOutline}
					>
						{$t('components.layout.header.button.login')}
					</Button>
					<Button
						size="small"
						fill="outline"
						click={() => goto(PageRoute.AUTH.REGISTER)}
						iconSrc={personAddOutline}
					>
						{$t('components.layout.header.button.register')}
					</Button>
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
