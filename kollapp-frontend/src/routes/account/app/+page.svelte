<script lang="ts">
	import { actionSheetController } from '@ionic/core';
	import { arrowForward } from 'ionicons/icons';

	import Layout from '$lib/components/layout/Layout.svelte';
	import { locale, t } from '$lib/locales';
	import { Locale } from '$lib/models/locale';
	import { PreferencesKey } from '$lib/models/preferences';
	import { Theme } from '$lib/models/theme';
	import { themeStore } from '$lib/store';
	import { clickableElement, storeValue } from '$lib/utils';

	async function updateLocale(value: Locale): Promise<void> {
		locale.set(value);
		await storeValue(PreferencesKey.LOCALE, value);
	}

	async function changeLanguage(): Promise<void> {
		const actionsheet = await actionSheetController.create({
			translucent: true,
			header: $t('routes.account.app.language.action-sheet.title'),
			buttons: [
				{
					text: $t('routes.account.app.language.action-sheet.buttons.german'),
					handler: () => updateLocale(Locale.DE)
				},
				{
					text: $t('routes.account.app.language.action-sheet.buttons.english'),
					handler: () => updateLocale(Locale.EN)
				}
			]
		});

		await actionsheet.present();
	}
</script>

<Layout title={$t('routes.account.app.title')} showBackButton>
	<ion-list-header>{$t('routes.account.app.list.appearence.title')}</ion-list-header>
	<ion-list inset>
		<ion-item color="light">
			<ion-toggle
				onchange={() => themeStore.toggle()}
				justify="space-between"
				checked={$themeStore === Theme.DARK}
			>
				{$t('routes.account.app.list.appearence.button')}
			</ion-toggle>
		</ion-item>
	</ion-list>
	<ion-list-header>{$t('routes.account.app.list.language.title')}</ion-list-header>
	<ion-list inset>
		<ion-item color="light" use:clickableElement={changeLanguage}>
			<ion-label>{$t('routes.account.app.list.language.button')}</ion-label>
			<ion-icon icon={arrowForward} slot="end"></ion-icon>
		</ion-item>
	</ion-list>
</Layout>
