<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { cashOutline, chevronDownOutline, chevronUpOutline, trendingDown, trendingUp } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type ChartType = 'all' | 'credit' | 'debit';

	interface Properties {
		postings: PostingTO[];
		tourId?: string;
	}

	const MINIMAL_POSTINGS_FOR_INTERACTION = 1;
	const INITIAL_DISPLAY_COUNT = 5;

	let { postings, tourId }: Properties = $props();

	let selectedChart = $state<ChartType>('all');
	let showAllCredits = $state<boolean>(false);
	let showAllDebits = $state<boolean>(false);
	let mounted = $state<boolean>(false);

	onMount(() => {
		mounted = true;
	});

	const creditPostings = $derived(postings?.filter((p) => p.type === 'CREDIT') ?? []);
	const debitPostings = $derived(postings?.filter((p) => p.type === 'DEBIT') ?? []);

	const sortedCreditPostings = $derived([...creditPostings].toSorted((a, b) => b.amountInCents - a.amountInCents));
	const sortedDebitPostings = $derived([...debitPostings].toSorted((a, b) => b.amountInCents - a.amountInCents));

	const displayedCreditPostings = $derived(
		showAllCredits ? sortedCreditPostings : sortedCreditPostings.slice(0, INITIAL_DISPLAY_COUNT)
	);
	const displayedDebitPostings = $derived(
		showAllDebits ? sortedDebitPostings : sortedDebitPostings.slice(0, INITIAL_DISPLAY_COUNT)
	);

	const creditCount = $derived(creditPostings.length);
	const debitCount = $derived(debitPostings.length);

	const hasMoreCredits = $derived(creditCount > INITIAL_DISPLAY_COUNT);
	const hasMoreDebits = $derived(debitCount > INITIAL_DISPLAY_COUNT);

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
				const othersAmount = sumAmount(sortedCreditPostings.slice(INITIAL_DISPLAY_COUNT));
				const hasOthers = !showAllCredits && othersAmount > 0;

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
				const othersAmount = sumAmount(sortedDebitPostings.slice(INITIAL_DISPLAY_COUNT));
				const hasOthers = !showAllDebits && othersAmount > 0;

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
	const showExpandButton = $derived(
		(selectedChart === 'credit' && hasMoreCredits) || (selectedChart === 'debit' && hasMoreDebits)
	);
	const isExpanded = $derived(
		(selectedChart === 'credit' && showAllCredits) || (selectedChart === 'debit' && showAllDebits)
	);

	function toggleExpand(): void {
		if (selectedChart === 'credit') {
			showAllCredits = !showAllCredits;
		} else if (selectedChart === 'debit') {
			showAllDebits = !showAllDebits;
		}
	}

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
			height: 350,
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
			position: 'bottom',
			show: true
		},
		series: chartData.series,
		states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
		tooltip: {
			enabled: false
		}
	});
</script>

<div data-tour={tourId}>
	<h1 class="mt-5 mb-2 text-center">{$t('components.widgets.budget-card.heading')}</h1>

	{#if postings && postings.length > 0}
		{#if hasEnoughForInteraction}
			<div class="flex items-center justify-center gap-2">
				<Chip
					icon={cashOutline}
					label={$t('components.widgets.budget-card.all')}
					color="secondary"
					selected={selectedChart === 'all'}
					clicked={() => (selectedChart = 'all')}
				/>
				{#if creditCount > 0}
					<Chip
						icon={trendingUp}
						label={$t('components.widgets.budget-card.credit')}
						color="success"
						selected={selectedChart === 'credit'}
						clicked={() => (selectedChart = 'credit')}
					/>
				{/if}
				{#if debitCount > 0}
					<Chip
						icon={trendingDown}
						label={$t('components.widgets.budget-card.debit')}
						color="danger"
						selected={selectedChart === 'debit'}
						clicked={() => (selectedChart = 'debit')}
					/>
				{/if}
			</div>
		{/if}

		<div class="relative h-[350px]">
			{#if selectedChart === 'all'}
				<ion-text class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-7 text-center text-xl font-bold">
					{formatter.currency(totalBudget)}
				</ion-text>
			{/if}
			{#if mounted}
				<Chart options={chartOptions}></Chart>
			{/if}
		</div>

		{#if showExpandButton}
			<div class="flex justify-center">
				<Button
					size="small"
					fill="outline"
					icon={isExpanded ? chevronUpOutline : chevronDownOutline}
					label={isExpanded
						? $t('components.widgets.budget-card.show-less')
						: $t('components.widgets.budget-card.show-more')}
					clicked={toggleExpand}
				/>
			</div>
		{/if}
	{:else}
		<div class="text-medium mt-5 text-center">
			<ion-note>{$t('components.widgets.budget-card.no-postings')}</ion-note>
		</div>
	{/if}
</div>
