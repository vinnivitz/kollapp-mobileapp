<script lang="ts">
	import { bugOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models';
</script>

<Layout title="Kollapp">
	<div class="text-center">
		<ion-icon icon={bugOutline} class="text-7xl"></ion-icon>
	</div>

	<Card title={$t('common.error-page.card.title')}>
		<div class="text-center">
			<Button onClick={async () => await goto(PageRoute.HOME)}>
				{$t('common.error-page.card.content.button')}
			</Button>
		</div>
	</Card>
</Layout>
