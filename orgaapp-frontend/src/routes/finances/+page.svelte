<script>
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';

	const events = [{ name: 'Event 1' }, { name: 'Event 2' }, { name: 'Event 3' }];
</script>

<IonLayout title="Oragaapp">
	<Card title={$t('routes.finances.title')} subtitle={$t('routes.finances.subtitle')}></Card>
</IonLayout>
