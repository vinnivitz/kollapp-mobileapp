<script lang="ts">
	import type { ActivityTO, PostingTO } from '@kollapp/api-types';

	import { arrowForwardOutline, cashOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { budgetService } from '$lib/api/services';
	import { Card } from '$lib/components/core';
	import { PostingItem } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { organizationStore } from '$lib/stores';
	import { formatter } from '$lib/utility';

	const LATEST_POSTINGS_COUNT = 4;

	type Properties = {
		postings: PostingTO[];
		editMode?: boolean;
		tourId?: string;
	};

	let { editMode = false, postings, tourId }: Properties = $props();

	const creditPostings = $derived(postings?.filter((p) => p.type === 'CREDIT') ?? []);
	const debitPostings = $derived(postings?.filter((p) => p.type === 'DEBIT') ?? []);

	const creditTotal = $derived(creditPostings.reduce((sum, posting) => sum + posting.amountInCents, 0));
	const debitTotal = $derived(debitPostings.reduce((sum, posting) => sum + posting.amountInCents, 0));
	const balance = $derived(creditTotal - debitTotal);

	const total = $derived(creditTotal + debitTotal);
	const creditPercent = $derived(total > 0 ? (creditTotal / total) * 100 : 50);

	const latestPostings = $derived(
		[...(postings ?? [])]
			.toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
			.slice(0, LATEST_POSTINGS_COUNT)
	);

	const activityByPostingId = $derived<Map<number, ActivityTO>>(
		new Map(
			($organizationStore?.activities ?? []).flatMap((activity) =>
				activity.activityPostings.map((posting) => [posting.id, activity] as [number, ActivityTO])
			)
		)
	);
</script>

<Card
	titleIconEnd={editMode ? undefined : arrowForwardOutline}
	title={$t('components.widgets.budget-card.heading')}
	titleIconStart={cashOutline}
	border="secondary"
	{tourId}
	clicked={async () => goto(resolve('/organization/budget-statistics'))}
	readonly={editMode}
>
	{#if postings && postings.length > 0}
		<div class="flex flex-col items-center gap-1 pb-3">
			<ion-text class="text-xs" color="medium">{$t('components.widgets.budget-card.balance')}</ion-text>
			<ion-text
				class="budget-balance text-3xl font-bold"
				color={balance >= 0 ? 'success' : 'danger'}
				data-testid="budget-balance"
			>
				{formatter.currency(balance)}
			</ion-text>
		</div>

		{#if total > 0}
			<div class="px-1 pb-3">
				<div class="flex overflow-hidden rounded-full" data-testid="budget-ratio-bar" style="height: 10px;">
					<div
						class="transition-all duration-500"
						style="width: {creditPercent}%; background: var(--ion-color-success);"
					></div>
					<div
						class="transition-all duration-500"
						style="width: {100 - creditPercent}%; background: var(--ion-color-danger);"
					></div>
				</div>
				<div class="mt-2 flex justify-between text-xs">
					<div class="flex items-center gap-1">
						<ion-icon icon={trendingUpOutline} color="success" class="text-sm"></ion-icon>
						<ion-text color="success">{formatter.currency(creditTotal)}</ion-text>
					</div>
					<div class="flex items-center gap-1">
						<ion-icon icon={trendingDownOutline} color="danger" class="text-sm"></ion-icon>
						<ion-text color="danger">{formatter.currency(debitTotal)}</ion-text>
					</div>
				</div>
			</div>
		{/if}

		{#if latestPostings.length > 0}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="ion-activatable border-t border-(--ion-color-light-shade)"
				onclick={(event_) => event_.stopPropagation()}
			>
				<ion-list>
					<ion-list-header>
						<ion-text class="px-1 text-sm font-medium" color="medium">
							{$t('components.widgets.budget-card.latest-postings')}
						</ion-text>
					</ion-list-header>
					{#each latestPostings as posting (posting.id)}
						<PostingItem
							{posting}
							activity={activityByPostingId.get(posting.id)}
							activities={$organizationStore?.activities ?? []}
							budgetCategories={$organizationStore?.budgetCategories ?? []}
							personsOfOrganization={$organizationStore?.personsOfOrganization ?? []}
							onEditStart={() => {}}
							onEditEnd={() => {}}
							onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
							onUpdateActivityPosting={budgetService.updateActivityPosting}
							onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
							onTransferActivityPosting={budgetService.transferActivityPosting}
							onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
							onDeleteActivityPosting={budgetService.deleteActivityPosting}
						/>
					{/each}
				</ion-list>
			</div>
		{/if}
	{:else}
		<div class="text-medium mt-5 text-center italic">
			<ion-note>{$t('components.widgets.budget-card.no-postings')}</ion-note>
		</div>
	{/if}
</Card>
