<script>
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
</script>

<IonLayout title="Oragaapp">
	<Card title={$t('routes.finances.title')} subtitle={$t('routes.finances.subtitle')}></Card>
</IonLayout>
