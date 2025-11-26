<script lang="ts">
	import type { ActionSheetButton } from '@ionic/core';

	import { actionSheetController } from '@ionic/core';
	import {
		buildOutline,
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
		refreshOutline,
		sunnyOutline,
		trashOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import LayoutComponent from '$lib/components/layout/Layout.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import { Locale, t } from '$lib/locales';
	import { Layout, Theme } from '$lib/models/ui';
	import { layoutStore, localeStore, themeStore } from '$lib/stores';

	async function openActionSheet(header: string, buttons: ActionSheetButton[]): Promise<void> {
		const actionsheet = await actionSheetController.create({
			buttons,
			header,
			translucent: true
		});

		await actionsheet.present();
	}

	async function openLocaleActionSheet(): Promise<void> {
		await openActionSheet($t('routes.account.language.action-sheet.title'), [
			{
				handler: () => localeStore.set(Locale.DE),
				icon: '/locale/de.svg',
				role: $localeStore === Locale.DE ? 'selected' : undefined,
				text: $t('routes.account.language.action-sheet.buttons.german')
			},
			{
				handler: () => localeStore.set(Locale.EN),
				icon: '/locale/gb.svg',
				role: $localeStore === Locale.EN ? 'selected' : undefined,
				text: $t('routes.account.language.action-sheet.buttons.english')
			}
		]);
	}

	async function openLayoutActionSheet(): Promise<void> {
		await openActionSheet($t('routes.account.layout.action-sheet.title'), [
			{
				handler: () => layoutStore.set(Layout.MD),
				icon: logoAndroid,
				role: $layoutStore === Layout.MD ? 'selected' : undefined,
				text: $t('routes.account.layout.action-sheet.buttons.md')
			},
			{
				handler: () => layoutStore.set(Layout.IOS),
				icon: logoApple,
				role: $layoutStore === Layout.IOS ? 'selected' : undefined,
				text: $t('routes.account.layout.action-sheet.buttons.ios')
			}
		]);
	}

	async function openColorThemeActionSheet(): Promise<void> {
		await openActionSheet($t('routes.account.theme.action-sheet.title'), [
			{
				handler: () => themeStore.set(Theme.SYSTEM),
				icon: desktopOutline,
				role: $themeStore === Theme.SYSTEM ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.system')
			},
			{
				handler: () => themeStore.set(Theme.LIGHT),
				icon: sunnyOutline,
				role: $themeStore === Theme.LIGHT ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.light')
			},
			{
				handler: () => themeStore.set(Theme.DARK),
				icon: moonOutline,
				role: $themeStore === Theme.DARK ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.dark')
			},
			{
				handler: () => themeStore.set(Theme.BLACK_AND_WHITE),
				icon: contrastOutline,
				role: $themeStore === Theme.BLACK_AND_WHITE ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.bw')
			}
		]);
	}

	async function restoreApplicationDefaults(): Promise<void> {
		await Promise.all([themeStore.reset(), layoutStore.reset(), localeStore.reset()]);
	}
</script>

<LayoutComponent title={$t('routes.account.title')}>
	{@render accountList()}
	{@render applicationList()}
</LayoutComponent>

{#snippet accountList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.account.list.account.title')}</ion-list-header>
		<LabeledItem
			indexed="/account/notifications"
			clicked={() => goto(resolve('/account/notifications'))}
			icon={notificationsOutline}
			label={$t('routes.account.list.account.button.notifications')}
		/>
		<LabeledItem
			indexed="/account/update-data"
			clicked={() => goto(resolve('/account/update-data'))}
			icon={buildOutline}
			label={$t('routes.account.list.account.button.update-data')}
		/>
		<LabeledItem
			indexed="/account/privacy-and-security"
			clicked={() => goto(resolve('/account/privacy-and-security'))}
			icon={lockClosedOutline}
			label={$t('routes.account.list.account.button.privacy-and-security')}
		/>
		<LabeledItem
			indexed="/account/delete"
			clicked={() => goto(resolve('/account/delete'))}
			icon={trashOutline}
			label={$t('routes.account.list.account.button.delete-account')}
		/>
	</ion-list>
{/snippet}

{#snippet applicationList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.account.list.application.title')}</ion-list-header>
		<LabeledItem
			indexed="/account"
			clicked={openLocaleActionSheet}
			icon={languageOutline}
			label={$t('routes.account.app.list.language.button')}
		/>
		<LabeledItem
			indexed="/account"
			clicked={openColorThemeActionSheet}
			icon={colorPaletteOutline}
			label={$t('routes.account.app.list.theme.button')}
		/>
		<LabeledItem
			indexed="/account"
			clicked={openLayoutActionSheet}
			icon={colorWandOutline}
			label={$t('routes.account.app.list.layout.button')}
		/>
		<LabeledItem
			indexed="/account"
			clicked={restoreApplicationDefaults}
			icon={refreshOutline}
			label={$t('routes.account.app.list.restore.button')}
		/>
	</ion-list>
{/snippet}
