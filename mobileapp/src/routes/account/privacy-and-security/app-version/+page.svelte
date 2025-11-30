<script lang="ts">
	import type { ReleaseNotesTO } from '$lib/api/dtos';

	import { onMount } from 'svelte';

	import { metaService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';

	let releaseNotes = $state<ReleaseNotesTO[]>([]);

	onMount(async () => (releaseNotes = await metaService.getReleaseNotes()));
</script>

<Layout title={$t('routes.account.privacy-and-security.app-version.page.title')} showBackButton>
	{#each releaseNotes.toReversed() as note (note.version)}
		<Card title={$t('routes.account.privacy-and-security.app-version.page.card.title', { value: note.version })}>
			<ion-list>
				{#each note.changes as change (change)}
					<ion-item lines="none">
						<ion-label color="medium" class="bullet">{change}</ion-label>
					</ion-item>
				{/each}
			</ion-list>
		</Card>
	{/each}
</Layout>

<style>
	.bullet::before {
		content: '• ';
		margin-right: 0.5em;
	}
</style>
