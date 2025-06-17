<script lang="ts">
	import { accessibilityOutline, personOutline } from 'ionicons/icons';

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
		<Card title={$t('routes.home.card.user.title', { value: $userStore?.username })} classList="text-center">
			<Button fill="outline" label="Go to account" icon={personOutline} click={() => goto(PageRoute.ACCOUNT.ROOT)} />
		</Card>

		{#if $organizationStore}
			<Card title={$organizationStore.name} classList="text-center">
				<Button
					click={() => goto(PageRoute.ORGANIZATION.ROOT)}
					fill="outline"
					icon={accessibilityOutline}
					label={$t('routes.home.card.organization.button')}
				/>
			</Card>
			<Card title="Notifications" classList="text-center">
				<ion-text>{$t('routes.home.card.notifications.no-notes')}</ion-text>
			</Card>
		{:else}
			<Card title={$t('routes.home.card.register-organization.title')} classList="text-center">
				<Button
					click={() => goto(PageRoute.ORGANIZATION.REGISTER)}
					fill="outline"
					icon={accessibilityOutline}
					label={$t('routes.home.card.organization.register')}
				/>
			</Card>
			<Card title={$t('routes.home.card.join-organization.title')} classList="text-center">
				<Button
					click={() => goto(PageRoute.ORGANIZATION.JOIN)}
					fill="outline"
					icon={accessibilityOutline}
					label={$t('routes.home.card.organization.join')}
				/>
			</Card>
		{/if}
	{/if}
</Layout>
