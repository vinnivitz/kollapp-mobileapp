<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { PostingTO } from '@kollapp/api-types';

	import {
		analyticsOutline,
		downloadOutline,
		statsChartOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';

	import { Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		postings: PostingTO[];
		onDownload?: () => void;
	};

	let { onDownload, postings }: Properties = $props();

	function median(values: number[]): number {
		if (values.length === 0) return 0;
		const sorted = [...values].toSorted((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);
		return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
	}

	const medianAll = $derived(median(postings.map((p) => p.amountInCents)));

	const medianCredit = $derived(median(postings.filter((p) => p.type === 'CREDIT').map((p) => p.amountInCents)));

	const medianDebit = $derived(median(postings.filter((p) => p.type === 'DEBIT').map((p) => p.amountInCents)));

	const averageAll = $derived(
		postings.length > 0 ? postings.reduce((sum, p) => sum + p.amountInCents, 0) / postings.length : 0
	);
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.median.title')}
	titleIconStart={analyticsOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	<div class="grid grid-cols-2 gap-4">
		{@render statCard(
			$t('routes.organization.budget-statistics.page.median.all'),
			statsChartOutline,
			medianAll,
			'primary'
		)}
		{@render statCard(
			$t('routes.organization.budget-statistics.page.median.avg-comparison'),
			analyticsOutline,
			averageAll,
			'tertiary'
		)}
		{@render statCard(
			$t('routes.organization.budget-statistics.page.median.credit'),
			trendingUpOutline,
			medianCredit,
			'success'
		)}
		{@render statCard(
			$t('routes.organization.budget-statistics.page.median.debit'),
			trendingDownOutline,
			medianDebit,
			'danger'
		)}
	</div>

	{#if postings.length > 0}
		<div class="mt-3 text-center">
			<ion-note class="text-xs">
				{$t('routes.organization.budget-statistics.page.median.hint', {
					value: formatter.currency(Math.abs(medianAll - averageAll))
				})}
			</ion-note>
		</div>
	{/if}
</Card>

{#snippet statCard(label: string, icon: string, amount: number, color: Colors)}
	<Card classList="m-0" border={color} contentClass="p-3!">
		<div class="flex flex-col items-center gap-1 text-center">
			<ion-icon {icon} {color} class="text-xl"></ion-icon>
			<ion-text class="text-xs" color="medium">{label}</ion-text>
			<ion-text class="text-base font-bold" {color}>{formatter.currency(amount)}</ion-text>
		</div>
	</Card>
{/snippet}
