<script lang="ts">
	import '@ionic/core/components/ion-refresher';
	import '@ionic/core/components/ion-refresher-content';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';

	function onRefresh(refresher: HTMLIonRefresherElement): void {
		setTimeout(() => {
			refresher.complete();
		}, 1000);
	}
</script>

<Layout title={$t('routes.finances.title')} {onRefresh}>
	<Card title={$t('routes.finances.title')}>
		<div class="text-center">
			{$t('routes.finances.subtitle')}
		</div>
	</Card>
</Layout>
