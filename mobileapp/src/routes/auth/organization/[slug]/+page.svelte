<script lang="ts">
	import type { PageData } from './$types';
	import type { OrganizationMinifiedTO } from '@kollapp/api-types';

	import {
		accessibilityOutline,
		addOutline,
		bugOutline,
		checkboxOutline,
		homeOutline,
		locationOutline,
		logInOutline,
		readerOutline
	} from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { organizationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';
	import { t } from '$lib/locales';
	import { organizationStore } from '$lib/stores';
	import { isAuthenticated, StatusCheck } from '$lib/utility';

	const { data }: { data: PageData } = $props();

	const organizations = $derived(organizationStore.organizations);
	const isAlreadyMember = $derived($organizations.some((organization) => organization.id === $organizationStore?.id));

	let loading = $state<boolean>(true);
	let organization = $state<OrganizationMinifiedTO>();
	let authenticated = $state<boolean>(false);

	async function onJoinCollective(): Promise<void> {
		const result = await organizationService.joinByInvitationCode({ code: data.code });
		if (StatusCheck.isOK(result.status)) {
			await goto(resolve('/organization'));
		}
	}

	onMount(async () => {
		const [organizationResult, authenticatedResult] = await Promise.all([
			organizationService.getByInvitationCode(data.code),
			isAuthenticated()
		]);
		if (StatusCheck.isOK(organizationResult.status)) {
			organization = organizationResult.data;
			authenticated = authenticatedResult;
		}
		loading = false;
	});
</script>

<Layout title={$t('routes.auth.organization.slug.page.title')} showBackButton {loading} hideMenu={!authenticated}>
	{#if organization}
		{@render collectiveDetails(organization)}
	{:else}
		{@render invalidCode()}
	{/if}
</Layout>

<!-- Snippets -->

{#snippet collectiveDetails(organization: OrganizationMinifiedTO)}
	<Card title={$t('routes.auth.organization.slug.page.card.join.title')}>
		<InputItem
			readonly
			label={$t('routes.auth.organization.slug.page.card.join.form.name')}
			icon={accessibilityOutline}
			value={organization?.name}
		></InputItem>
		<TextareaInputItem
			readonly
			label={$t('routes.auth.organization.slug.page.card.join.form.description')}
			icon={readerOutline}
			value={organization?.description}
		></TextareaInputItem>
		<InputItem
			readonly
			label={$t('routes.auth.organization.slug.page.card.join.form.place')}
			icon={locationOutline}
			value={organization?.place}
		></InputItem>
		<div class="mt-3 text-center">
			{#if !isAlreadyMember}
				{#if authenticated}
					<Button
						icon={addOutline}
						label={$t('routes.auth.organization.slug.page.card.join.form.submit')}
						clicked={() => onJoinCollective()}
					/>
				{:else}
					<div class="flex flex-col">
						<Button
							label={$t('routes.auth.organization.slug.page.card.join.form.login')}
							icon={logInOutline}
							clicked={() => goto(resolve('/auth/login'))}
						/>
						<ion-note>{$t('routes.auth.organization.slug.page.card.join.form.info.not-authenticated')}</ion-note>
					</div>
				{/if}
			{:else}
				<Card border="success">
					<div class="flex flex-row items-center justify-center gap-3">
						<ion-icon size="large" icon={checkboxOutline} color="success"></ion-icon>
						<ion-note color="success">
							{$t('routes.auth.organization.slug.page.card.join.form.info.already-member')}
						</ion-note>
					</div>
				</Card>
			{/if}
		</div>
	</Card>
{/snippet}

{#snippet invalidCode()}
	<Card
		title={$t('routes.auth.organization.slug.page.card.invalid-code.title')}
		titleIconStart={bugOutline}
		border="danger"
	>
		<div class="flex flex-col items-center justify-center gap-4">
			<ion-text class="text-center">{$t('routes.auth.organization.slug.page.card.invalid-code.info')}</ion-text>
			<Button
				icon={homeOutline}
				label={$t('routes.auth.organization.slug.page.card.invalid-code.button.go-back')}
				clicked={() => goto(resolve('/'))}
			/>
		</div>
	</Card>
{/snippet}
