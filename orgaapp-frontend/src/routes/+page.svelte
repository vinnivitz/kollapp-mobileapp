<script lang="ts">
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import IonCard from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
</script>

<IonLayout title={$t('routes.home.title')}>
	<IonCard color="primary" title={$t('routes.home.card.title')}>
		<div class="text-center">
			{$t('routes.home.card.content')}
		</div>
	</IonCard>
</IonLayout>
