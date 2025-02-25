<script lang="ts">
	import type { ActionSheetButton } from '@ionic/core';
	import { actionSheetController } from 'ionic-svelte';
	import {
		balloonOutline,
		colorPaletteOutline,
		colorWandOutline,
		diamondOutline,
		gridOutline,
		keyOutline,
		languageOutline,
		maleFemaleOutline,
		moonOutline,
		refreshOutline,
		saveOutline,
		sunnyOutline
	} from 'ionicons/icons';
	import { get } from 'svelte/store';

	import { goto } from '$app/navigation';

	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Item from '$lib/components/widgets/Item.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Layout, Locale, Theme } from '$lib/models/store';
	import { localeStore, themeStore } from '$lib/store';
	import { layoutStore } from '$lib/store/layout.store';

	async function openActionSheet(header: string, buttons: ActionSheetButton[]): Promise<void> {
		const actionsheet = await actionSheetController.create({
			translucent: true,
			header,
			buttons
		});

		await actionsheet.present();
	}

	async function openLocaleActionSheet(): Promise<void> {
		const currentLocale = get(localeStore);

		await openActionSheet($t('routes.account.language.action-sheet.title'), [
			{
				text: $t('routes.account.language.action-sheet.buttons.german'),
				handler: () => localeStore.set(Locale.DE),
				icon: '/locale/de.svg',
				role: currentLocale === Locale.DE ? 'selected' : undefined
			},
			{
				text: $t('routes.account.language.action-sheet.buttons.english'),
				handler: () => localeStore.set(Locale.EN),
				icon: '/locale/gb.svg',
				role: currentLocale === Locale.EN ? 'selected' : undefined
			}
		]);
	}

	async function openLayoutActionSheet(): Promise<void> {
		const currentLayout = get(layoutStore);

		await openActionSheet($t('routes.account.layout.action-sheet.title'), [
			{
				text: $t('routes.account.layout.action-sheet.buttons.classic'),
				handler: () => layoutStore.set(Layout.CLASSIC),
				icon: gridOutline,
				role: currentLayout === Layout.CLASSIC ? 'selected' : undefined
			},
			{
				text: $t('routes.account.layout.action-sheet.buttons.modern'),
				handler: () => layoutStore.set(Layout.MODERN),
				icon: diamondOutline,
				role: currentLayout === Layout.MODERN ? 'selected' : undefined
			},
			{
				text: $t('routes.account.layout.action-sheet.buttons.playful'),
				handler: () => layoutStore.set(Layout.PLAYFUL),
				icon: balloonOutline,
				role: currentLayout === Layout.PLAYFUL ? 'selected' : undefined
			}
		]);
	}

	async function openColorThemeActionSheet(): Promise<void> {
		const currentTheme = get(themeStore);

		await openActionSheet($t('routes.account.theme.action-sheet.title'), [
			{
				text: $t('routes.account.theme.action-sheet.buttons.system'),
				handler: () => themeStore.set(Theme.SYSTEM),
				icon: saveOutline,
				role: currentTheme === Theme.SYSTEM ? 'selected' : undefined
			},
			{
				text: $t('routes.account.theme.action-sheet.buttons.light'),
				handler: () => themeStore.set(Theme.LIGHT),
				icon: sunnyOutline,
				role: currentTheme === Theme.LIGHT ? 'selected' : undefined
			},
			{
				text: $t('routes.account.theme.action-sheet.buttons.dark'),
				handler: () => themeStore.set(Theme.DARK),
				icon: moonOutline,
				role: currentTheme === Theme.DARK ? 'selected' : undefined
			},
			{
				text: $t('routes.account.theme.action-sheet.buttons.fancy'),
				handler: () => themeStore.set(Theme.FANCY),
				icon: maleFemaleOutline,
				role: currentTheme === Theme.FANCY ? 'selected' : undefined
			}
		]);
	}

	function restoreApplicationDefaults(): void {
		themeStore.reset();
		layoutStore.reset();
		localeStore.reset();
	}
</script>

<IonLayout title={$t('routes.account.title')}>
	<ion-list-header>{$t('routes.account.list.account.title')}</ion-list-header>
	<ion-list inset>
		<Item detail click={() => goto(PageRoute.ACCOUNT.CHANGE_PASSWORD)}>
			<div class="flex flex-row items-center gap-4">
				<ion-icon icon={keyOutline} size="large"></ion-icon>
				<ion-label>{$t('routes.account.list.account.button.change-password')}</ion-label>
			</div>
		</Item>
	</ion-list>
	<ion-list-header>{$t('routes.account.list.application.title')}</ion-list-header>
	<ion-list inset>
		<Item detail click={openLocaleActionSheet}>
			<div class="flex flex-row items-center gap-4">
				<ion-icon icon={languageOutline} size="large"></ion-icon>
				<ion-label>{$t('routes.account.app.list.language.button')}</ion-label>
			</div>
		</Item>
		<Item detail click={openColorThemeActionSheet}>
			<div class="flex flex-row items-center gap-4">
				<ion-icon icon={colorPaletteOutline} size="large"></ion-icon>
				<ion-label>{$t('routes.account.app.list.theme.button')}</ion-label>
			</div>
		</Item>
		<Item detail click={openLayoutActionSheet}>
			<div class="flex flex-row items-center gap-4">
				<ion-icon icon={colorWandOutline} size="large"></ion-icon>
				<ion-label>{$t('routes.account.app.list.layout.button')}</ion-label>
			</div>
		</Item>
		<Item detail click={restoreApplicationDefaults}>
			<div class="flex flex-row items-center gap-4">
				<ion-icon icon={refreshOutline} size="large"></ion-icon>
				<ion-label>{$t('routes.account.app.list.restore.button')}</ion-label>
			</div>
		</Item>
	</ion-list>
</IonLayout>
