<script lang="ts">
	import type { ActionSheetButton } from '@ionic/core';
	import { actionSheetController } from 'ionic-svelte';
	import {
		balloonOutline,
		colorPaletteOutline,
		colorWandOutline,
		contrastOutline,
		desktopOutline,
		diamondOutline,
		gridOutline,
		keyOutline,
		languageOutline,
		moonOutline,
		personOutline,
		refreshOutline,
		sunnyOutline,
		trashOutline
	} from 'ionicons/icons';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	import { goto } from '$app/navigation';

	import type { PageData } from './$types';

	import LayoutComponent from '$lib/components/layout/Layout.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { Layout, Locale, Theme } from '$lib/models/store';
	import { localeStore, themeStore } from '$lib/store';
	import { layoutStore } from '$lib/store/layout.store';

	let { data }: { data: PageData } = $props();

	async function openActionSheet(header: string, buttons: ActionSheetButton[]): Promise<void> {
		const actionsheet = await actionSheetController.create({
			translucent: true,
			header,
			buttons,
			cssClass: 'custom-action-sheet',
			id: 'custom-action-sheet'
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
				icon: desktopOutline,
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
				text: $t('routes.account.theme.action-sheet.buttons.black-and-white'),
				handler: () => themeStore.set(Theme.BLACK_AND_WHITE),
				icon: contrastOutline,
				role: currentTheme === Theme.BLACK_AND_WHITE ? 'selected' : undefined
			}
		]);
	}

	function restoreApplicationDefaults(): void {
		themeStore.reset();
		layoutStore.reset();
		localeStore.reset();
	}

	function triggerHighlighting(): void {
		const labels = document.querySelectorAll('ion-label');
		const element = [...labels].find((label) => label.textContent === data.label);
		if (element) {
			element.style.setProperty('color', 'var(--ion-color-primary)');
			setTimeout(() => element.style.removeProperty('color'), 200);
			setTimeout(() => element.style.setProperty('color', 'var(--ion-color-primary)'), 400);
			setTimeout(() => element.style.removeProperty('color'), 600);
			setTimeout(() => element.style.setProperty('color', 'var(--ion-color-primary)'), 800);
			setTimeout(() => element.style.removeProperty('color'), 1000);
		}
	}

	onMount(() => {
		if (data?.label) {
			triggerHighlighting();
		}
	});
</script>

<LayoutComponent title={$t('routes.account.title')}>
	<ion-list inset>
		<ion-list-header>{$t('routes.account.list.account.title')}</ion-list-header>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.UPDATE_DATA}
			detail
			click={() => goto(PageRoute.ACCOUNT.UPDATE_DATA)}
			iconSrc={personOutline}
			label={$t('routes.account.list.account.button.update-data')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.CHANGE_PASSWORD}
			detail
			click={() => goto(PageRoute.ACCOUNT.CHANGE_PASSWORD)}
			iconSrc={keyOutline}
			label={$t('routes.account.list.account.button.change-password')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.DELETE}
			detail
			color="danger"
			click={() => goto(PageRoute.ACCOUNT.DELETE)}
			iconSrc={trashOutline}
			label={$t('routes.account.list.account.button.delete-account')}
		/>
	</ion-list>
	<ion-list inset>
		<ion-list-header>{$t('routes.account.list.application.title')}</ion-list-header>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			detail
			click={openLocaleActionSheet}
			iconSrc={languageOutline}
			label={$t('routes.account.app.list.language.button')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			detail
			click={openColorThemeActionSheet}
			iconSrc={colorPaletteOutline}
			label={$t('routes.account.app.list.theme.button')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			detail
			click={openLayoutActionSheet}
			iconSrc={colorWandOutline}
			label={$t('routes.account.app.list.layout.button')}
		/>
		<LabeledItem
			searchable={PageRoute.ACCOUNT.ROOT}
			detail
			click={restoreApplicationDefaults}
			iconSrc={refreshOutline}
			label={$t('routes.account.app.list.restore.button')}
		/>
	</ion-list>
</LayoutComponent>
