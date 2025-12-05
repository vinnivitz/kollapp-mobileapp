<script lang="ts">
	import type { PageData } from './$types';
	import type { OrganizationBaseTO } from '@kollapp/api-types';

	import { homeOutline, locationOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { StatusCheck } from '$lib/utility';

	let { data }: { data: PageData } = $props();

	let loading = $state<boolean>(true);
	let organization = $state<OrganizationBaseTO>();

	onMount(async () => {
		if (data.invitationCode) {
			const response = await organizationService.getByInvitationCode(data.invitationCode);
			if (StatusCheck.isOK(response.status)) {
				organization = response.data;
			}
		}
		loading = false;
	});
</script>

<Layout title={$t('routes.organization.info.page.title')} {loading} showBackButton>
	{#if organization}
		{@render infoCard(organization)}
	{:else}
		{@render invalidCodeCard()}
	{/if}
</Layout>

<!-- Snippets -->

{#snippet infoCard(organization: OrganizationBaseTO)}
	<Card title={organization.name} classList="text-center">
		<div class="flex flex-col items-center justify-center gap-2">
			{#if organization.description}
				<ion-text>{organization.description}</ion-text>
			{/if}
			<ion-text color="medium" class="flex items-center justify-center gap-2">
				<ion-icon icon={locationOutline}></ion-icon>
				<div>{organization.place}</div>
			</ion-text>
		</div>
	</Card>
{/snippet}

{#snippet invalidCodeCard()}
	<Card title={$t('routes.organization.info.page.card.invalid-code.title')}>
		<div class="flex flex-col items-center justify-center gap-2">
			<ion-text class="text-center" color="medium">
				{$t('routes.organization.info.page.card.invalid-code.content')}
			</ion-text>
			<Button
				label={$t('routes.organization.info.page.card.invalid-code.button.back-to-home')}
				icon={homeOutline}
				fill="outline"
				clicked={() => goto(resolve('/'))}
			/>
		</div>
	</Card>
{/snippet}
