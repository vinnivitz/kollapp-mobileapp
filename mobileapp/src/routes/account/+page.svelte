<script lang="ts">
	import type { ActionSheetButton } from '@ionic/core';

	import { actionSheetController } from 'ionic-svelte';
	import {
		buildOutline,
		colorPaletteOutline,
		colorWandOutline,
		contrastOutline,
		desktopOutline,
		keyOutline,
		languageOutline,
		logoAndroid,
		logoApple,
		moonOutline,
		refreshOutline,
		sunnyOutline,
		trashOutline
	} from 'ionicons/icons';
	import { get } from 'svelte/store';

	import { goto } from '$app/navigation';

	import LayoutComponent from '$lib/components/layout/Layout.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { Locale, t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
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
		const currentLocale = get(localeStore);

		await openActionSheet($t('routes.account.language.action-sheet.title'), [
			{
				handler: () => localeStore.set(Locale.DE),
				icon: '/locale/de.svg',
				role: currentLocale === Locale.DE ? 'selected' : undefined,
				text: $t('routes.account.language.action-sheet.buttons.german')
			},
			{
				handler: () => localeStore.set(Locale.EN),
				icon: '/locale/gb.svg',
				role: currentLocale === Locale.EN ? 'selected' : undefined,
				text: $t('routes.account.language.action-sheet.buttons.english')
			}
		]);
	}

	async function openLayoutActionSheet(): Promise<void> {
		const currentLayout = get(layoutStore);

		await openActionSheet($t('routes.account.layout.action-sheet.title'), [
			{
				handler: () => layoutStore.set(Layout.MD),
				icon: logoAndroid,
				role: currentLayout === Layout.MD ? 'selected' : undefined,
				text: $t('routes.account.layout.action-sheet.buttons.md')
			},
			{
				handler: () => layoutStore.set(Layout.IOS),
				icon: logoApple,
				role: currentLayout === Layout.IOS ? 'selected' : undefined,
				text: $t('routes.account.layout.action-sheet.buttons.ios')
			}
		]);
	}

	async function openColorThemeActionSheet(): Promise<void> {
		const currentTheme = get(themeStore);

		await openActionSheet($t('routes.account.theme.action-sheet.title'), [
			{
				handler: () => themeStore.set(Theme.SYSTEM),
				icon: desktopOutline,
				role: currentTheme === Theme.SYSTEM ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.system')
			},
			{
				handler: () => themeStore.set(Theme.LIGHT),
				icon: sunnyOutline,
				role: currentTheme === Theme.LIGHT ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.light')
			},
			{
				handler: () => themeStore.set(Theme.DARK),
				icon: moonOutline,
				role: currentTheme === Theme.DARK ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.dark')
			},
			{
				handler: () => themeStore.set(Theme.BLACK_AND_WHITE),
				icon: contrastOutline,
				role: currentTheme === Theme.BLACK_AND_WHITE ? 'selected' : undefined,
				text: $t('routes.account.theme.action-sheet.buttons.black-and-white')
			}
		]);
	}

	function restoreApplicationDefaults(): void {
		themeStore.reset();
		layoutStore.reset();
		localeStore.reset();
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
			searchable={PageRoute.ACCOUNT.UPDATE_DATA}
			click={() => goto(PageRoute.ACCOUNT.UPDATE_DATA)}
			icon={buildOutline}
			label={$t('routes.account.list.account.button.update-data')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.CHANGE_PASSWORD}
			click={() => goto(PageRoute.ACCOUNT.CHANGE_PASSWORD)}
			icon={keyOutline}
			label={$t('routes.account.list.account.button.change-password')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.DELETE}
			color="danger"
			click={() => goto(PageRoute.ACCOUNT.DELETE)}
			icon={trashOutline}
			label={$t('routes.account.list.account.button.delete-account')}
		/>
	</ion-list>
{/snippet}

{#snippet applicationList()}
	<ion-list inset>
		<ion-list-header>{$t('routes.account.list.application.title')}</ion-list-header>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			click={openLocaleActionSheet}
			icon={languageOutline}
			label={$t('routes.account.app.list.language.button')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			click={openColorThemeActionSheet}
			icon={colorPaletteOutline}
			label={$t('routes.account.app.list.theme.button')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			click={openLayoutActionSheet}
			icon={colorWandOutline}
			label={$t('routes.account.app.list.layout.button')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			click={restoreApplicationDefaults}
			icon={refreshOutline}
			label={$t('routes.account.app.list.restore.button')}
		/>
	</ion-list>
{/snippet}
