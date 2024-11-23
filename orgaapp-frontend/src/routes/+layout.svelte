<script lang="ts">
	import '../app.pcss';
	import 'ionic-svelte/components/all';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { setupIonicBase } from 'ionic-svelte';
	import IonTabs from 'ionic-svelte/components/IonTabs.svelte';

	import { i18n } from '$lib/i18n';
	import { tabs } from '$lib/utils';

	// @ts-expect-error - ionic svelte component is not typed

	let { children } = $props();

	setupIonicBase({
		animated: false
	});
</script>

<svelte:head>
	<title>Orgaapp</title>
</svelte:head>

<ParaglideJS {i18n}>
	<ion-app>
		<IonTabs {tabs}>
			{@render children()}
		</IonTabs>
	</ion-app>
</ParaglideJS>
