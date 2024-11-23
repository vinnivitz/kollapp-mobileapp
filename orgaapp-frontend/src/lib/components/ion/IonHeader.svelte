<script lang="ts">
	import { person } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import { PageRoute } from '$lib/models';
	import { clickableElement } from '$lib/utils/index';

	let { title }: { title: string } = $props();
</script>

<ion-header>
	<ion-toolbar>
		<ion-title>{title}</ion-title>

		<ion-buttons slot="start">
			<img
				use:clickableElement={() => goto(PageRoute.HOME)}
				src="/favicon.png"
				alt="User"
				class="h-8 w-8"
			/>
		</ion-buttons>
		<ion-buttons slot="end">
			<ion-icon icon={person} class="me-1 text-2xl"></ion-icon>
		</ion-buttons>
	</ion-toolbar>
</ion-header>
