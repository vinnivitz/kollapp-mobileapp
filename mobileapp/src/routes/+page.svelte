<script lang="ts">
	import { accessibilityOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { initializationStore, organizationStore, userStore } from '$lib/stores';
</script>

<Layout title={$t('routes.home.title')}>
	{#if $initializationStore}
		<Card title={$t('routes.home.card.user.title', { value: $userStore?.username })} />

		{#if $organizationStore}
			<Card title={$organizationStore.name}>
				<div class="text-center">
					<Button
						click={() => goto(PageRoute.ORGANIZATION.ROOT)}
						fill="outline"
						icon={accessibilityOutline}
						label={$t('routes.home.card.organization.button')}
					/>
				</div>
			</Card>
		{:else}
			<Card title={$t('routes.home.card.register-organization.title')}>
				<div class="text-center">
					<Button
						click={() => goto(PageRoute.ORGANIZATION.REGISTER)}
						fill="outline"
						icon={accessibilityOutline}
						label={$t('routes.home.card.organization.register')}
					/>
				</div>
			</Card>
			<Card title={$t('routes.home.card.join-organization.title')}>
				<div class="text-center">
					<Button
						click={() => goto(PageRoute.ORGANIZATION.JOIN)}
						fill="outline"
						icon={accessibilityOutline}
						label={$t('routes.home.card.organization.join')}
					/>
				</div>
			</Card>
		{/if}
	{/if}
</Layout>
