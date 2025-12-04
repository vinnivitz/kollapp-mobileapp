<script lang="ts">
	import { bugOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
</script>

<div class="text-center">
	<ion-icon icon={bugOutline} class="text-7xl"></ion-icon>
</div>
<Card title={$t('components.widgets.page-not-found.title')}>
	<div class="text-center">
		<Button
			fill="solid"
			clicked={() => goto(resolve('/'))}
			label={$t('components.widgets.page-not-found.button.back-to-home')}
		/>
	</div>
</Card>
