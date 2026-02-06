<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { arrowForwardOutline, cashOutline, trendingDown, trendingUp } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { Card, Chip } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type ChartType = 'all' | 'credit' | 'debit';

	type Properties = {
		postings: PostingTO[];
		editMode?: boolean;
		tourId?: string;
	};

	let { editMode = false, postings, tourId }: Properties = $props();

	const MINIMAL_POSTINGS_FOR_INTERACTION = 1;
	const DISPLAY_COUNT = 5;

	let selectedChart = $state<ChartType>('all');
	let mounted = $state<boolean>(false);

	onMount(() => (mounted = true));

	const creditPostings = $derived(postings?.filter((p) => p.type === 'CREDIT') ?? []);
	const debitPostings = $derived(postings?.filter((p) => p.type === 'DEBIT') ?? []);

	const sortedCreditPostings = $derived([...creditPostings].toSorted((a, b) => b.amountInCents - a.amountInCents));
	const sortedDebitPostings = $derived([...debitPostings].toSorted((a, b) => b.amountInCents - a.amountInCents));

	const displayedCreditPostings = $derived(sortedCreditPostings.slice(0, DISPLAY_COUNT));
	const displayedDebitPostings = $derived(sortedDebitPostings.slice(0, DISPLAY_COUNT));

	const creditCount = $derived(creditPostings.length);
	const debitCount = $derived(debitPostings.length);

	const creditTotal = $derived(sumAmount(creditPostings));
	const debitTotal = $derived(sumAmount(debitPostings));
	const totalBudget = $derived(creditTotal - debitTotal);

	const hasEnoughForInteraction = $derived(
		creditCount >= MINIMAL_POSTINGS_FOR_INTERACTION || debitCount >= MINIMAL_POSTINGS_FOR_INTERACTION
	);

	function sumAmount(items: PostingTO[]): number {
		return items.reduce((sum, p) => sum + p.amountInCents, 0);
	}

	function buildChartData(type: ChartType): { colors: string[]; labels: string[]; series: number[] } {
		switch (type) {
			case 'credit': {
				const othersAmount = sumAmount(sortedCreditPostings.slice(DISPLAY_COUNT));
				const hasOthers = othersAmount > 0;

				return {
					colors: [
						...displayedCreditPostings.map((_, index) => `hsl(${120 + index * 15}, 60%, ${50 + (index % 3) * 10}%)`),
						...(hasOthers ? ['hsl(120, 20%, 70%)'] : [])
					],
					labels: [
						...displayedCreditPostings.map((posting) => posting.purpose),
						...(hasOthers ? [$t('components.widgets.budget-card.others')] : [])
					],
					series: [
						...displayedCreditPostings.map((posting) => posting.amountInCents),
						...(hasOthers ? [othersAmount] : [])
					]
				};
			}
			case 'debit': {
				const othersAmount = sumAmount(sortedDebitPostings.slice(DISPLAY_COUNT));
				const hasOthers = othersAmount > 0;

				return {
					colors: [
						...displayedDebitPostings.map((_, index) => `hsl(${0 + index * 10}, 60%, ${50 + (index % 3) * 10}%)`),
						...(hasOthers ? ['hsl(0, 20%, 70%)'] : [])
					],
					labels: [
						...displayedDebitPostings.map((posting) => posting.purpose),
						...(hasOthers ? [$t('components.widgets.budget-card.others')] : [])
					],
					series: [
						...displayedDebitPostings.map((posting) => posting.amountInCents),
						...(hasOthers ? [othersAmount] : [])
					]
				};
			}
			default: {
				return {
					colors: ['var(--ion-color-success-tint)', 'var(--ion-color-danger-tint)'],
					labels: [$t('components.widgets.budget-card.credit'), $t('components.widgets.budget-card.debit')],
					series: [creditTotal, debitTotal]
				};
			}
		}
	}

	const chartData = $derived(buildChartData(selectedChart));

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			events: {
				dataPointSelection:
					selectedChart === 'all' && hasEnoughForInteraction
						? (_event, _chartContext, options) => {
								const index = options.dataPointIndex ?? 0;
								const target: ChartType = index === 0 ? 'credit' : 'debit';
								const hasData = target === 'credit' ? creditCount > 0 : debitCount > 0;
								if (hasData) selectedChart = target;
							}
						: undefined
			},
			height: 340,
			toolbar: { show: false },
			type: 'donut'
		},
		colors: chartData.colors,
		dataLabels: {
			enabled: true,
			formatter: (_value: number, options: { seriesIndex: number }) => {
				const value = chartData.series[options.seriesIndex]!;
				return formatter.currency(value);
			}
		},
		labels: chartData.labels,
		legend: {
			labels: {
				colors: 'var(--ion-color-dark)'
			},
			position: 'bottom',
			show: true
		},
		series: chartData.series,
		states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
		tooltip: {
			enabled: false
		}
	});

	function getTotalByType(type: ChartType): number {
		switch (type) {
			case 'credit': {
				return creditTotal;
			}
			case 'debit': {
				return debitTotal;
			}
			default: {
				return totalBudget;
			}
		}
	}
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
		{#if hasEnoughForInteraction}
			<div class="flex items-center justify-center gap-2">
				<Chip
					classList="text-xs"
					icon={cashOutline}
					label={$t('components.widgets.budget-card.all')}
					color="secondary"
					selected={selectedChart === 'all'}
					clicked={() => (selectedChart = 'all')}
				/>
				{#if creditCount > 0}
					<Chip
						classList="text-xs"
						icon={trendingUp}
						label={$t('components.widgets.budget-card.credit')}
						color="success"
						selected={selectedChart === 'credit'}
						clicked={() => (selectedChart = 'credit')}
					/>
				{/if}
				{#if debitCount > 0}
					<Chip
						classList="text-xs"
						icon={trendingDown}
						label={$t('components.widgets.budget-card.debit')}
						color="danger"
						selected={selectedChart === 'debit'}
						clicked={() => (selectedChart = 'debit')}
					/>
				{/if}
			</div>
		{/if}

		<div class="h-[340px]">
			{#if mounted}
				<ion-text
					class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3 text-center text-xl font-bold"
					class:-translate-y-5={selectedChart !== 'all'}
				>
					{selectedChart === 'debit' ? '-' : ''}{formatter.currency(getTotalByType(selectedChart))}
				</ion-text>
				<div class="absolute top-12 right-0 left-0">
					<Chart options={chartOptions}></Chart>
				</div>
			{/if}
		</div>
	{:else}
		<div class="text-medium mt-5 text-center italic">
			<ion-note>{$t('components.widgets.budget-card.no-postings')}</ion-note>
		</div>
	{/if}
</Card>
