<script lang="ts">
	import type { PageData } from './$types';
	import type { OrganizationBaseTO } from '@kollapp/api-types';

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
	import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import { organizationStore } from '$lib/stores';
	import { isAuthenticated, StatusCheck } from '$lib/utility';

	let loading = $state(true);
	let organization = $state<OrganizationBaseTO>();
	let authenticated = $state(false);

	const { data }: { data: PageData } = $props();

	async function onJoinCollective(): Promise<void> {
		const result = await organizationService.joinByInvitationCode(data.code);
		if (StatusCheck.isOK(result.status)) {
			await organizationStore.update(result.data.id);
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
		}
		authenticated = authenticatedResult;
		loading = false;
	});
</script>

<Layout title="Collective" showBackButton {loading} hideMenu={!authenticated}>
	{#if organization}
		<Card title="Collective Details">
			<form>
				<TextInputItem readonly name="name" label="Name" icon={accessibilityOutline} value={organization?.name}
				></TextInputItem>
				<TextareaInputItem
					readonly
					name="description"
					label="Description"
					icon={readerOutline}
					value={organization?.description}
				></TextareaInputItem>
				<TextInputItem readonly name="place" label="Place" icon={locationOutline} value={organization?.place}
				></TextInputItem>
				<div class="mt-3 text-center">
					{#if organization.name !== $organizationStore?.name}
						{#if authenticated}
							<Button icon={addOutline} label="Join Collective" clicked={() => onJoinCollective()} />
						{:else}
							<div class="flex flex-col">
								<Button label="Log in" icon={logInOutline} clicked={() => goto(resolve('/auth/login'))} />
								<ion-note>You need to be logged in to join a collective.</ion-note>
							</div>
						{/if}
					{:else}
						<Card border="success">
							<div class="flex flex-row items-center justify-center gap-3">
								<ion-icon size="large" icon={checkboxOutline} color="success"></ion-icon>
								<ion-note color="success">You are already a member of this collective.</ion-note>
							</div>
						</Card>
					{/if}
				</div>
			</form>
		</Card>
	{:else}
		<Card title="Invalid Code" titleIconStart={bugOutline} border="danger">
			<div class="flex flex-col items-center justify-center gap-4">
				<ion-text class="text-center">The provided code is invalid. Please ask the collective admin.</ion-text>
				<Button icon={homeOutline} label="Go back" clicked={() => goto(resolve('/'))} />
			</div>
		</Card>
	{/if}
</Layout>
