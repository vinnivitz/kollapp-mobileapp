<script lang="ts">
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import IonCard from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
</script>

<IonLayout title={$t('routes.home.title')}>
	<IonCard title={$t('routes.home.card.title')}>{$t('routes.home.card.content')}</IonCard>
</IonLayout>
