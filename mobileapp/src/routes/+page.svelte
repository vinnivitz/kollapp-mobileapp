<script lang="ts">
	import type { OrganizationModel } from '$lib/models/models';

	import { accessibilityOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import { organizationStore, userStore } from '$lib/stores';

	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);
</script>

<Layout title={$t('routes.home.title')}>
	<Card title={$t('routes.home.card.user.title', { value: $userStore?.username })} />

	{#if organizationModel}
		<Card title={organizationModel.name}>
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
</Layout>
