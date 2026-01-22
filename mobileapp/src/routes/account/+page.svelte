<script lang="ts">
	import type { ActionSheetButton } from '@ionic/core';

	import { actionSheetController } from '@ionic/core';
	import {
		colorPaletteOutline,
		colorWandOutline,
		contrastOutline,
		desktopOutline,
		languageOutline,
		lockClosedOutline,
		logoAndroid,
		logoApple,
		moonOutline,
		notificationsOutline,
		personOutline,
		refreshOutline,
		sunnyOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import germanFlag from '$lib/assets/locale/de.svg';
	import englishFlag from '$lib/assets/locale/gb.svg';
	import LayoutComponent from '$lib/components/layout/Layout.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { Locale, t } from '$lib/locales';
	import { Layout, Theme } from '$lib/models/ui';
	import { layoutStore, localeStore, themeStore } from '$lib/stores';
	import { confirmationModal } from '$lib/utility';

	async function openActionSheet(header: string, buttons: ActionSheetButton[]): Promise<void> {
		const actionsheet = await actionSheetController.create({
			buttons,
			header,
			translucent: true
		});

		await actionsheet.present();
	}

	async function openLocaleActionSheet(): Promise<void> {
		await openActionSheet($t('routes.account.page.modal.language.title'), [
			{
				handler: () => localeStore.set(Locale.DE),
				icon: germanFlag,
				role: $localeStore === Locale.DE ? 'selected' : undefined,
				text: $t('routes.account.page.modal.language.german')
			},
			{
				handler: () => localeStore.set(Locale.EN),
				icon: englishFlag,
				role: $localeStore === Locale.EN ? 'selected' : undefined,
				text: $t('routes.account.page.modal.language.english')
			}
		]);
	}

	async function openLayoutActionSheet(): Promise<void> {
		await openActionSheet($t('routes.account.page.modal.layout.title'), [
			{
				handler: () => layoutStore.set(Layout.MD),
				icon: logoAndroid,
				role: $layoutStore === Layout.MD ? 'selected' : undefined,
				text: $t('routes.account.page.modal.layout.md')
			},
			{
				handler: () => layoutStore.set(Layout.IOS),
				icon: logoApple,
				role: $layoutStore === Layout.IOS ? 'selected' : undefined,
				text: $t('routes.account.page.modal.layout.ios')
			}
		]);
	}

	async function openColorThemeActionSheet(): Promise<void> {
		await openActionSheet($t('routes.account.page.modal.color-theme.title'), [
			{
				handler: () => themeStore.set(Theme.SYSTEM),
				icon: desktopOutline,
				role: $themeStore === Theme.SYSTEM ? 'selected' : undefined,
				text: $t('routes.account.page.modal.color-theme.system')
			},
			{
				handler: () => themeStore.set(Theme.LIGHT),
				icon: sunnyOutline,
				role: $themeStore === Theme.LIGHT ? 'selected' : undefined,
				text: $t('routes.account.page.modal.color-theme.light')
			},
			{
				handler: () => themeStore.set(Theme.DARK),
				icon: moonOutline,
				role: $themeStore === Theme.DARK ? 'selected' : undefined,
				text: $t('routes.account.page.modal.color-theme.dark')
			},
			{
				handler: () => themeStore.set(Theme.BLACK_AND_WHITE),
				icon: contrastOutline,
				role: $themeStore === Theme.BLACK_AND_WHITE ? 'selected' : undefined,
				text: $t('routes.account.page.modal.color-theme.grayscale')
			}
		]);
	}

	async function onRestoreApplicationDefaults(): Promise<void> {
		await confirmationModal({
			handler: restoreApplicationDefaults,
			message: $t('routes.account.page.modal.restore-defaults.confirm')
		});
	}

	async function restoreApplicationDefaults(): Promise<void> {
		await Promise.all([themeStore.reset(), layoutStore.reset(), localeStore.reset()]);
	}
</script>

<LayoutComponent title={$t('routes.account.page.title')}>
	{@render accountList()}
	{@render applicationList()}
</LayoutComponent>

{#snippet accountList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.account.page.list.personal.header')}</ion-list-header>
		<LabeledItem
			indexed="/account/notifications"
			clicked={() => goto(resolve('/account/notifications'))}
			icon={notificationsOutline}
			label={$t('routes.account.page.list.personal.notifications')}
		/>
		<LabeledItem
			indexed="/account/update-data"
			clicked={() => goto(resolve('/account/update-data'))}
			icon={personOutline}
			label={$t('routes.account.page.list.personal.my-data')}
		/>
		<LabeledItem
			indexed="/account/privacy-and-security"
			clicked={() => goto(resolve('/account/privacy-and-security'))}
			icon={lockClosedOutline}
			label={$t('routes.account.page.list.personal.privacy-and-security')}
		/>
	</ion-list>
{/snippet}

{#snippet applicationList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.account.page.list.application.header')}</ion-list-header>
		<LabeledItem
			indexed="/account"
			clicked={openLocaleActionSheet}
			icon={languageOutline}
			label={$t('routes.account.page.list.application.language')}
		/>
		<LabeledItem
			indexed="/account"
			clicked={openColorThemeActionSheet}
			icon={colorPaletteOutline}
			label={$t('routes.account.page.list.application.color-theme')}
		/>
		<LabeledItem
			indexed="/account"
			clicked={openLayoutActionSheet}
			icon={colorWandOutline}
			label={$t('routes.account.page.list.application.layout')}
		/>
		<LabeledItem
			indexed="/account"
			clicked={onRestoreApplicationDefaults}
			icon={refreshOutline}
			label={$t('routes.account.page.list.application.restore-defaults')}
		/>
	</ion-list>
{/snippet}
