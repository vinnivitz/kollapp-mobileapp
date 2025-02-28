<script lang="ts">
	import { accessibilityOutline, logOutOutline, personOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { apiResources } from '$lib/api';
	import Button from '$lib/components/widgets/Button.svelte';
	import LabeledItem from '$lib/components/widgets/LabeledItem.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';

	async function logout(): Promise<void> {
		await apiResources.auth.logout();
		goto(PageRoute.AUTH.LOGIN);
	}
</script>

<ion-menu side="end" content-id="menu">
	<ion-header>
		<ion-toolbar>
			<ion-searchbar
				debounce={100}
				placeholder={$t('components.layout.menu.searchbar.placeholder')}
			>
			</ion-searchbar>
		</ion-toolbar>
	</ion-header>
	<ion-content class="ion-padding relative text-center">
		<ion-list>
			<LabeledItem
				transparent
				click={() => goto(PageRoute.ACCOUNT.ROOT)}
				iconSrc={personOutline}
				label={$t('components.layout.header.button.account')}
			/>
			<LabeledItem
				transparent
				click={() => goto(PageRoute.ORGANIZATION.ROOT)}
				iconSrc={accessibilityOutline}
				label={$t('components.layout.menu.list.organization')}
			/>
		</ion-list>
		<Button
			size="small"
			fill="outline"
			click={() => logout()}
			iconSrc={logOutOutline}
			label={$t('components.layout.header.button.logout')}
		/>
		<hr class="my-3" />
		<div class="absolute bottom-2 left-0 right-0">
			<hr class="my-2" />
			<ion-note>Made with <ion-text color="danger">&#10084;</ion-text> from Dresden.</ion-note>
		</div>
	</ion-content>
</ion-menu>
