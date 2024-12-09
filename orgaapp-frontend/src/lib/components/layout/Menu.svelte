<script lang="ts">
	import { goto } from '$app/navigation';

	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models';
	import { clickableElement } from '$lib/utils';
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
			<ion-button fill="outline" use:clickableElement={() => goto(PageRoute.AUTH_LOGIN)}>
				{$t('components.layout.header.button.login')}
			</ion-button>
			<ion-button fill="outline" use:clickableElement={() => goto(PageRoute.AUTH_REGISTER)}>
				{$t('components.layout.header.button.register')}
			</ion-button>
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
