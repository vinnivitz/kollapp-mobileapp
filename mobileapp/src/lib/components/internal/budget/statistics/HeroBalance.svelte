<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { PostingTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { startOfMonth, subMonths } from 'date-fns';
	import {
		arrowDownOutline,
		arrowUpOutline,
		cardOutline,
		downloadOutline,
		removeOutline,
		statsChartOutline,
		swapHorizontalOutline,
		trendingDownOutline,
		trendingUpOutline,
		walletOutline
	} from 'ionicons/icons';

	import { Card, IconLabel } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		averageTransaction: number;
		balance: number;
		postings: PostingTO[];
		totalCredit: number;
		totalDebit: number;
		transactionCount: number;
		onDownload?: () => void;
	};

	let { averageTransaction, balance, onDownload, postings, totalCredit, totalDebit, transactionCount }: Properties =
		$props();

	const total = $derived(totalCredit + totalDebit);
	const creditPercent = $derived(total > 0 ? (totalCredit / total) * 100 : 50);

	const now = new TZDate();
	const currentMonthStart = startOfMonth(now);
	const previousMonthStart = startOfMonth(subMonths(now, 1));

	const monthlyChange = $derived.by<number>(() => {
		const currentMonthDebit = postings
			.filter((p) => p.type === 'DEBIT' && new TZDate(p.date) >= currentMonthStart)
			.reduce((sum, p) => sum + p.amountInCents, 0);
		const previousMonthDebit = postings
			.filter((p) => {
				const date = new TZDate(p.date);
				return p.type === 'DEBIT' && date >= previousMonthStart && date < currentMonthStart;
			})
			.reduce((sum, p) => sum + p.amountInCents, 0);

		if (previousMonthDebit === 0) return 0;
		return ((currentMonthDebit - previousMonthDebit) / previousMonthDebit) * 100;
	});

	function getChangeIcon(change: number): string {
		if (change > 0) return arrowUpOutline;
		if (change < 0) return arrowDownOutline;
		return removeOutline;
	}

	function getChangeColor(change: number): Colors {
		if (change > 5) return 'danger';
		if (change < -5) return 'success';
		return 'medium';
	}

	function formatChange(change: number): string {
		const sign = change > 0 ? '+' : '';
		return `${sign}${change.toFixed(0)}%`;
	}
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.overview.title')}
	titleIconStart={walletOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
>
	<div class="flex flex-col items-center gap-2 py-2">
		<ion-text class="text-xs" color="medium"
			>{$t('routes.organization.budget-statistics.page.overview.balance')}</ion-text
		>
		<ion-text class="text-2xl font-bold" color={balance >= 0 ? 'success' : 'danger'}>
			{formatter.currency(balance)}
		</ion-text>

		{#if total > 0}
			<div class="w-full px-2">
				<div class="flex overflow-hidden rounded-full" style="height: 8px;">
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
						<ion-text color="success">{formatter.currency(totalCredit)}</ion-text>
					</div>
					<div class="flex items-center gap-1">
						<ion-icon icon={trendingDownOutline} color="danger" class="text-sm"></ion-icon>
						<ion-text color="danger">{formatter.currency(totalDebit)}</ion-text>
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-2 grid w-full grid-cols-3 gap-2 px-1">
			{@render miniKpi(
				swapHorizontalOutline,
				String(transactionCount),
				$t('routes.organization.budget-statistics.page.hero.transactions'),
				'secondary'
			)}
			{@render miniKpi(
				statsChartOutline,
				formatter.currency(averageTransaction, true),
				$t('routes.organization.budget-statistics.page.hero.avg-per-transaction'),
				'tertiary'
			)}
			{@render miniKpiWithChange()}
		</div>
	</div>
</Card>

{#snippet miniKpi(icon: string, value: string, label: string, color: Colors)}
	<div class="flex flex-col items-center gap-0.5 rounded-lg p-2" style="background: var(--ion-color-light);">
		<ion-icon {icon} {color} class="text-lg"></ion-icon>
		<ion-text class="text-sm font-bold">{value}</ion-text>
		<ion-note class="text-center text-[10px] leading-tight">{label}</ion-note>
	</div>
{/snippet}

{#snippet miniKpiWithChange()}
	<div class="flex flex-col items-center gap-0.5 rounded-lg p-2" style="background: var(--ion-color-light);">
		<ion-icon icon={cardOutline} color="primary" class="text-lg"></ion-icon>
		<IconLabel
			icon={getChangeIcon(monthlyChange)}
			label={formatChange(monthlyChange)}
			color={getChangeColor(monthlyChange)}
			size="sm"
			bold
		/>
		<ion-note class="text-center text-[10px] leading-tight"
			>{$t('routes.organization.budget-statistics.page.hero.vs-last-month')}</ion-note
		>
	</div>
{/snippet}
