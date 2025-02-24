<script lang="ts">
	import { goto } from '$app/navigation';

	import IonLayout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/Card.svelte';
	import { t } from '$lib/locales';
	import { PageRoute } from '$lib/models/routing';
	import type { OrganizationModel, UserModel } from '$lib/models/store';
	import { organizationStore, userStore } from '$lib/store';
	import { clickableElement } from '$lib/utils';

	const userModel = $derived<UserModel | undefined>($userStore);
	const organizationModel = $derived<OrganizationModel | undefined>($organizationStore);

	const loading = $derived<boolean>(!userModel || !organizationModel);
</script>

<IonLayout title={$t('routes.home.title')} {loading}>
	<Card
		title={userModel
			? `${$t('routes.home.card.authenticated.title')} ${userModel.username}`
			: $t('routes.home.card.title')}
	>
		<div class="text-center">
			{#if userModel}
				<ion-button
					color="tertiary"
					shape="round"
					size="small"
					use:clickableElement={() => goto(PageRoute.ACCOUNT.ROOT)}
				>
					{$t('routes.home.card.user.button')}
				</ion-button>
			{:else}
				{$t('routes.home.card.content')}
			{/if}
		</div>
	</Card>

	{#if organizationModel}
		<Card title={organizationModel.name}>
			<div class="text-center">
				<ion-button
					color="tertiary"
					shape="round"
					size="small"
					use:clickableElement={() => goto(PageRoute.ORGANIZATION.ROOT)}
				>
					{$t('routes.home.card.organization.button')}
				</ion-button>
			</div>
		</Card>
	{/if}
</IonLayout>
