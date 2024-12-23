<script lang="ts">
	import { arrowForward } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { isAuthenticated } from '$lib/api/utils';
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models';
	import { clickableElement } from '$lib/utils';
</script>

<IonLayout title={$t('routes.account.title')}>
	<ion-list-header>{$t('routes.account.list.account.title')}</ion-list-header>
	<ion-list inset>
		{#await isAuthenticated() then authenticated}
			{#if authenticated}
				<ion-item use:clickableElement={() => goto(PageRoute.ACCOUNT_CHANGE_PASSWORD)}>
					<ion-label>{$t('routes.account.list.account.button.change-password')}</ion-label>
					<ion-icon icon={arrowForward} slot="end"></ion-icon>
				</ion-item>
			{:else}
				<ion-item use:clickableElement={() => goto(PageRoute.AUTH_REGISTER)}>
					<ion-label>{$t('routes.account.list.account.button.register')}</ion-label>
					<ion-icon icon={arrowForward} slot="end"></ion-icon>
				</ion-item>
				<ion-item use:clickableElement={() => goto(PageRoute.AUTH_LOGIN)}>
					<ion-label>{$t('routes.account.list.account.button.login')}</ion-label>
					<ion-icon icon={arrowForward} slot="end"></ion-icon>
				</ion-item>
			{/if}
		{/await}
	</ion-list>
	<ion-list-header>{$t('routes.account.list.application.title')}</ion-list-header>
	<ion-list inset>
		<ion-item use:clickableElement={() => goto(PageRoute.ACCOUNT_APP)}>
			<ion-label>{$t('routes.account.list.application.button')}</ion-label>
			<ion-icon icon={arrowForward} slot="end"></ion-icon>
		</ion-item>
	</ion-list>
</IonLayout>
