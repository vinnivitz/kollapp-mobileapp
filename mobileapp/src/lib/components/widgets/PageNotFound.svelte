<script lang="ts">
	import { bugOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
</script>

<div class="text-center">
	<ion-icon icon={bugOutline} class="text-7xl"></ion-icon>
</div>
<Card title={$t('common.error-page.card.title')}>
	<div class="text-center">
		<Button
			fill="solid"
			click={async () => await goto(PageRoute.HOME)}
			label={$t('common.error-page.card.content.button')}
		/>
	</div>
</Card>
