<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';

	import { arrowForwardOutline, cashOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	const TOP_POSTINGS_COUNT = 3;

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

	const topExpenses = $derived(
		[...debitPostings].toSorted((a, b) => b.amountInCents - a.amountInCents).slice(0, TOP_POSTINGS_COUNT)
	);
	const topExpensesMaxAmount = $derived(topExpenses[0]?.amountInCents ?? 0);

	const topIncome = $derived(
		[...creditPostings].toSorted((a, b) => b.amountInCents - a.amountInCents).slice(0, TOP_POSTINGS_COUNT)
	);
	const topIncomeMaxAmount = $derived(topIncome[0]?.amountInCents ?? 0);
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

		{#if topExpenses.length > 0}
			<div class="border-t border-(--ion-color-light-shade) pt-2">
				<ion-text class="px-1 text-xs font-medium" color="medium">
					{$t('components.widgets.budget-card.top-expenses')}
				</ion-text>
				<div class="mt-1 flex flex-col gap-1.5 px-1 pb-1">
					{#each topExpenses as expense (expense.id)}
						<div class="flex items-center gap-2">
							<div class="min-w-0 flex-1">
								<div class="flex items-baseline justify-between gap-2">
									<ion-text class="truncate text-xs">{expense.purpose}</ion-text>
									<ion-text class="shrink-0 text-xs font-medium" color="danger">
										{formatter.currency(expense.amountInCents)}
									</ion-text>
								</div>
								{#if topExpensesMaxAmount > 0}
									<div class="mt-0.5 h-1 overflow-hidden rounded-full bg-(--ion-color-light-shade)">
										<div
											class="h-full rounded-full transition-all duration-500"
											style="width: {(expense.amountInCents / topExpensesMaxAmount) *
												100}%; background: var(--ion-color-danger-tint);"
										></div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if topIncome.length > 0}
			<div class="mt-3 border-t border-(--ion-color-light-shade) pt-2">
				<ion-text class="px-1 text-xs font-medium" color="medium">
					{$t('components.widgets.budget-card.top-income')}
				</ion-text>
				<div class="mt-1 flex flex-col gap-1.5 px-1 pb-1">
					{#each topIncome as income (income.id)}
						<div class="flex items-center gap-2">
							<div class="min-w-0 flex-1">
								<div class="flex items-baseline justify-between gap-2">
									<ion-text class="truncate text-xs">{income.purpose}</ion-text>
									<ion-text class="shrink-0 text-xs font-medium" color="success">
										{formatter.currency(income.amountInCents)}
									</ion-text>
								</div>
								{#if topIncomeMaxAmount > 0}
									<div class="mt-0.5 h-1 overflow-hidden rounded-full bg-(--ion-color-light-shade)">
										<div
											class="h-full rounded-full transition-all duration-500"
											style="width: {(income.amountInCents / topIncomeMaxAmount) *
												100}%; background: var(--ion-color-success-tint);"
										></div>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="text-medium mt-5 text-center italic">
			<ion-note>{$t('components.widgets.budget-card.no-postings')}</ion-note>
		</div>
	{/if}
</Card>
