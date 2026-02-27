<script lang="ts">
	import type { ActivityTO, PostingTO } from '@kollapp/api-types';

	import { downloadOutline, swapVerticalOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { budgetService } from '$lib/api/services';
	import { Card, Chip } from '$lib/components/core';
	import { PostingItem } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { organizationStore } from '$lib/stores';

	type Properties = {
		postings: PostingTO[];
		onDownload?: () => void;
		onEditEnd?: () => void;
		onEditStart?: () => void;
	};

	let { onDownload, onEditEnd, onEditStart, postings }: Properties = $props();

	type Tab = 'credits' | 'debits';

	const TOP_COUNT = 4;

	let activeTab = $state<Tab>('credits');

	const activityByPostingId = $derived<SvelteMap<number, ActivityTO>>(
		new SvelteMap(
			($organizationStore?.activities ?? []).flatMap((activity) =>
				activity.activityPostings.map((posting) => [posting.id, activity] as [number, ActivityTO])
			)
		)
	);

	const topCredits = $derived(
		[...postings]
			.filter((posting) => posting.type === 'CREDIT')
			.toSorted((a, b) => b.amountInCents - a.amountInCents)
			.slice(0, TOP_COUNT)
	);

	const topDebits = $derived(
		[...postings]
			.filter((posting) => posting.type === 'DEBIT')
			.toSorted((a, b) => b.amountInCents - a.amountInCents)
			.slice(0, TOP_COUNT)
	);

	const activePostings = $derived(activeTab === 'credits' ? topCredits : topDebits);
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.top-transactions.title')}
	titleIconStart={swapVerticalOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
	lazyHeight="380px"
>
	<div class="mb-3 flex items-center justify-center gap-2">
		<Chip
			color="success"
			label={$t('routes.organization.budget-statistics.page.top-credits.title')}
			icon={trendingUpOutline}
			selected={activeTab === 'credits'}
			clicked={() => (activeTab = 'credits')}
		/>
		<Chip
			color="danger"
			label={$t('routes.organization.budget-statistics.page.top-debits.title')}
			icon={trendingDownOutline}
			selected={activeTab === 'debits'}
			clicked={() => (activeTab = 'debits')}
		/>
	</div>

	{#if activePostings.length > 0}
		{#each activePostings as posting (posting.id)}
			<PostingItem
				onEditStart={() => onEditStart?.()}
				onEditEnd={() => onEditEnd?.()}
				personsOfOrganization={$organizationStore?.personsOfOrganization!}
				{posting}
				activity={activityByPostingId.get(posting.id)}
				activities={$organizationStore?.activities!}
				budgetCategories={$organizationStore?.budgetCategories!}
				onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
				onUpdateActivityPosting={budgetService.updateActivityPosting}
				onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
				onTransferActivityPosting={budgetService.transferActivityPosting}
				onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
				onDeleteActivityPosting={budgetService.deleteActivityPosting}
			/>
		{/each}
	{:else}
		<div class="py-6 text-center">
			<ion-note>
				{activeTab === 'credits'
					? $t('routes.organization.budget-statistics.page.top-transactions.no-credits')
					: $t('routes.organization.budget-statistics.page.top-transactions.no-debits')}
			</ion-note>
		</div>
	{/if}
</Card>
