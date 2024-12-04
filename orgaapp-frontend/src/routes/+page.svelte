<script lang="ts">
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import IonCard from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
</script>

<IonLayout title="Oragaapp">
	<IonCard title={$t('routes.home.title')}>This is an overview page.</IonCard>
</IonLayout>
