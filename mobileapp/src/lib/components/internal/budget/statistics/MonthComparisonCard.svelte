<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { PostingTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { endOfMonth, startOfMonth, subMonths } from 'date-fns';
	import { arrowDownOutline, arrowUpOutline, downloadOutline, gitCompareOutline, removeOutline } from 'ionicons/icons';

	import { Card, IconLabel } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		postings: PostingTO[];
		onDownload?: () => void;
	};

	type ComparisonData = {
		balanceChange: number;
		creditChange: number;
		currentCredit: number;
		currentDebit: number;
		debitChange: number;
		previousCredit: number;
		previousDebit: number;
	};

	let { onDownload, postings }: Properties = $props();

	const now = new TZDate();
	const currentMonthStart = startOfMonth(now);
	const currentMonthEnd = endOfMonth(now);
	const previousMonthStart = startOfMonth(subMonths(now, 1));
	const previousMonthEnd = endOfMonth(subMonths(now, 1));

	const comparison = $derived.by<ComparisonData>(() => {
		const currentMonthPostings = postings.filter((posting) => {
			const date = new TZDate(posting.date);
			return date >= currentMonthStart && date <= currentMonthEnd;
		});

		const previousMonthPostings = postings.filter((posting) => {
			const date = new TZDate(posting.date);
			return date >= previousMonthStart && date <= previousMonthEnd;
		});

		const currentCredit = currentMonthPostings
			.filter((posting) => posting.type === 'CREDIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0);
		const currentDebit = currentMonthPostings
			.filter((posting) => posting.type === 'DEBIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0);
		const previousCredit = previousMonthPostings
			.filter((posting) => posting.type === 'CREDIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0);
		const previousDebit = previousMonthPostings
			.filter((posting) => posting.type === 'DEBIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0);

		const creditChange = previousCredit > 0 ? ((currentCredit - previousCredit) / previousCredit) * 100 : 0;
		const debitChange = previousDebit > 0 ? ((currentDebit - previousDebit) / previousDebit) * 100 : 0;
		const currentBalance = currentCredit - currentDebit;
		const previousBalance = previousCredit - previousDebit;
		const balanceChange =
			previousBalance === 0 ? 0 : ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;

		return {
			balanceChange,
			creditChange,
			currentCredit,
			currentDebit,
			debitChange,
			previousCredit,
			previousDebit
		};
	});

	function getChangeIcon(change: number): string {
		if (change > 0) return arrowUpOutline;
		if (change < 0) return arrowDownOutline;
		return removeOutline;
	}

	function getChangeColor(change: number, isDebit: boolean): Colors {
		if (change === 0) return 'medium';
		if (isDebit) {
			return change > 0 ? 'danger' : 'success';
		}
		return change > 0 ? 'success' : 'danger';
	}

	function formatChange(change: number): string {
		const sign = change > 0 ? '+' : '';
		return `${sign}${change.toFixed(1)}%`;
	}
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.comparison.title')}
	titleIconStart={gitCompareOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
	classList="text-center"
>
	<ion-text color="medium" class="text-sm">
		{$t('routes.organization.budget-statistics.page.comparison.subtitle')}
	</ion-text>

	<div class="mt-2 flex flex-col gap-6">
		<div class="flex items-center justify-around gap-4">
			<div class="flex-1">
				{@render monthOverviewCard(
					$t('routes.organization.budget-statistics.page.comparison.credit'),
					comparison.currentCredit,
					false,
					comparison.creditChange,
					comparison.previousCredit
				)}
			</div>
			<div class="flex-1">
				{@render monthOverviewCard(
					$t('routes.organization.budget-statistics.page.comparison.debit'),
					comparison.currentDebit,
					true,
					comparison.debitChange,
					comparison.previousDebit
				)}
			</div>
		</div>
		{@render balanceTrend()}
	</div>
</Card>

{#snippet monthOverviewCard(label: string, amount: number, isDebit: boolean, change: number, previousAmount: number)}
	<Card border={isDebit ? 'danger' : 'success'} classList="m-0" contentClass="p-3!">
		<ion-text class="text-sm">
			{label}
		</ion-text>
		<div class="flex flex-col items-center justify-center gap-1">
			<ion-text color={isDebit ? 'danger' : 'success'} class="text-lg font-bold">
				{formatter.currency(amount)}
			</ion-text>
			{#if previousAmount > 0}
				<IconLabel
					icon={getChangeIcon(change)}
					label={formatChange(change)}
					color={getChangeColor(change, isDebit)}
					size="xs"
				/>
			{/if}
			<ion-note class="text-xs">
				{$t('routes.organization.budget-statistics.page.comparison.previous')}: {formatter.currency(previousAmount)}
			</ion-note>
		</div>
	</Card>
{/snippet}

{#snippet balanceTrend()}
	<div class="text-center">
		<ion-text>
			{$t('routes.organization.budget-statistics.page.comparison.balance-trend')}
		</ion-text>
		<IconLabel
			icon={getChangeIcon(comparison.balanceChange)}
			label={formatChange(comparison.balanceChange)}
			color={getChangeColor(comparison.balanceChange, false)}
			size="xl"
			bold
		/>
		{#if comparison.balanceChange > 0}
			<ion-text color="success" class="mt-1 text-xs">
				{$t('routes.organization.budget-statistics.page.comparison.improving')}
			</ion-text>
		{:else if comparison.balanceChange < 0}
			<ion-text color="danger" class="mt-1 text-xs">
				{$t('routes.organization.budget-statistics.page.comparison.declining')}
			</ion-text>
		{:else}
			<ion-text color="medium" class="mt-1 text-xs">
				{$t('routes.organization.budget-statistics.page.comparison.stable')}
			</ion-text>
		{/if}
	</div>
{/snippet}
