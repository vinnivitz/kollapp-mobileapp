<script lang="ts">
	import type { Colors } from '$lib/models/ui';

	import { cardOutline, statsChartOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';

	import { Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		averageTransaction: number;
		balance: number;
		totalCredit: number;
		totalDebit: number;
	};

	let { averageTransaction, balance, totalCredit, totalDebit }: Properties = $props();
</script>

<div class="grid grid-cols-2">
	{@render overviewCard(
		$t('routes.organization.budget-statistics.page.overview.credit'),
		trendingUpOutline,
		totalCredit,
		'success'
	)}
	{@render overviewCard(
		$t('routes.organization.budget-statistics.page.overview.debit'),
		trendingDownOutline,
		totalDebit,
		'danger'
	)}
	{@render overviewCard(
		$t('routes.organization.budget-statistics.page.overview.balance'),
		cardOutline,
		balance,
		balance >= 0 ? 'success' : 'danger'
	)}
	{@render overviewCard(
		$t('routes.organization.budget-statistics.page.overview.avg'),
		statsChartOutline,
		averageTransaction,
		'primary'
	)}
</div>

{#snippet overviewCard(label: string, icon: string, amount: number, color: Colors)}
	<Card classList="flex flex-col justify-center items-center">
		<div class="flex flex-col items-center gap-1 py-2">
			<ion-icon {icon} {color} class="text-2xl"></ion-icon>
			<ion-text class="text-xs" color="medium">
				{label}
			</ion-text>
			<ion-text class="text-lg font-bold" {color}>{formatter.currency(amount)}</ion-text>
		</div>
	</Card>
{/snippet}
