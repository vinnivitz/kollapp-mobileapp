<script lang="ts">
	import { accessibilityOutline, personOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/Button.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import type { OrganizationModel, UserModel } from '$lib/models/store';
	import { organizationStore, userStore } from '$lib/store';

	const userModel = $derived<UserModel | undefined>($userStore);
	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);
	const loading = $derived(!userModel || !organizationModel);
</script>

<IonLayout title={$t('routes.home.title')} {loading}>
	{#if userModel}
		<Card title={$t('routes.home.card.user.title', { value: userModel.username })}>
			<div class="text-center">
				<Button
					size="small"
					click={() => goto(PageRoute.ACCOUNT.ROOT)}
					iconSrc={personOutline}
					fill="outline"
				>
					<span class="dark:font-bold">
						{$t('routes.home.card.user.button')}
					</span>
				</Button>
			</div>
		</Card>
	{/if}

	{#if organizationModel}
		<Card title={organizationModel.name}>
			<div class="text-center">
				<Button
					size="small"
					click={() => goto(PageRoute.ORGANIZATION.ROOT)}
					fill="outline"
					iconSrc={accessibilityOutline}
				>
					<span class="dark:font-bold">
						{$t('routes.home.card.organization.button')}
					</span>
				</Button>
			</div>
		</Card>
	{/if}
</IonLayout>
