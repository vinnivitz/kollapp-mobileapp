<script lang="ts">
	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { organizationStore } from '$lib/store';

	const username = $derived<string | undefined>($organizationStore?.username ?? '');
</script>

<IonLayout title={$t('routes.home.title')}>
	<Card
		title={username
			? `${$t('routes.home.card.authenticated.title')} ${username}`
			: $t('routes.home.card.title')}
	>
		<div class="text-center">
			{$t('routes.home.card.content')}
		</div>
	</Card>
</IonLayout>
