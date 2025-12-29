<script lang="ts">
	import type { PostingTO, PostingType } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { format } from 'date-fns';
	import { calendarClearOutline, cashOutline, trendingDown, trendingUp } from 'ionicons/icons';

	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	enum ChartType {
		ALL,
		CREDIT,
		DEBIT
	}

	let { postings }: { postings?: PostingTO[] } = $props();

	const MINIMAL_POSTINGS_FOR_INTERACTION = 3;

	let selectedChart = $state<ChartType>(ChartType.ALL);
	let chartSeries = $state<ApexAxisChartSeries | ApexNonAxisChartSeries>();
	let labels = $state<string[]>();
	let colors = $state<string[]>();
	let selectedChartDataId = $state<number>();

	const debits = $derived(postings?.filter((posting) => posting.type === 'DEBIT').length ?? 0);
	const credits = $derived(postings?.filter((posting) => posting.type === 'CREDIT').length ?? 0);

	function getTotalAmountByType(type: PostingType): number {
		return (
			postings
				?.filter((posting) => posting.type === type)
				.reduce((accumulator, posting) => accumulator + posting.amountInCents, 0) ?? 0
		);
	}

	function getTotalBudget(): number {
		const totalCredits = getTotalAmountByType('CREDIT');
		const totalDebits = getTotalAmountByType('DEBIT');
		return totalCredits - totalDebits;
	}

	$effect(() => {
		switch (selectedChart) {
			case ChartType.CREDIT: {
				const credits = postings?.filter((posting) => posting.type === 'CREDIT') ?? [];
				chartSeries = [
					{
						data: credits.map((credit) => ({
							meta: { date: credit.date, id: credit.id, type: credit.type },
							x: credit.purpose,
							y: credit.amountInCents
						}))
					}
				];
				colors = undefined;
				break;
			}
			case ChartType.DEBIT: {
				const debits = postings?.filter((posting) => posting.type === 'DEBIT') ?? [];
				chartSeries = [
					{
						data: debits.map((debit) => ({
							meta: { date: debit.date, id: debit.id, type: debit.type },
							x: debit.purpose,
							y: debit.amountInCents
						}))
					}
				];
				colors = undefined;
				break;
			}
			default: {
				const credits = postings?.filter((posting) => posting.type === 'CREDIT') ?? [];
				const debits = postings?.filter((posting) => posting.type === 'DEBIT') ?? [];
				const creditTotal = credits.reduce((accumulator, credit) => accumulator + credit.amountInCents, 0);
				const debitTotal = debits.reduce((accumulator, debit) => accumulator + debit.amountInCents, 0);

				chartSeries = [creditTotal, debitTotal];
				colors = ['var(--ion-color-success-tint)', 'var(--ion-color-danger-tint)'];
				labels = ['Income', 'Expenses'];
				break;
			}
		}
	});

	const chartOptions = $derived<ApexOptions>({
		chart: {
			events: {
				dataPointSelection:
					credits > 2 || debits > 2
						? (_event, _chartContext, options) => {
								const clickedIndex = options.dataPointIndex ?? 0;

								const metaType = options?.w?.config?.series?.[0]?.data?.[clickedIndex]?.meta?.type as
									| PostingType
									| undefined;

								if (selectedChart !== ChartType.ALL) return;

								let target: ChartType | undefined;

								if (metaType === 'CREDIT' || metaType === 'DEBIT') {
									target = metaType === 'CREDIT' ? ChartType.CREDIT : ChartType.DEBIT;
								} else if (clickedIndex === 0) {
									target = ChartType.CREDIT;
								} else if (clickedIndex === 1) {
									target = ChartType.DEBIT;
								}

								if (target) {
									const allowed = (target === ChartType.CREDIT && credits) || (target === ChartType.DEBIT && debits);
									if (allowed) {
										setTimeout(() => setSelectedChart(target as ChartType));
									}
								}
							}
						: undefined
			},
			height: 350,
			toolbar: { show: false },
			type: selectedChart === ChartType.ALL ? 'donut' : 'treemap'
		},
		colors,
		labels,
		legend: {
			position: 'bottom',
			show: selectedChart === ChartType.ALL
		},
		plotOptions: {
			treemap: {
				distributed: true,
				enableShades: false
			}
		},
		series: chartSeries,
		states:
			credits > 0 || debits > 0
				? { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } }
				: undefined,
		tooltip:
			selectedChart === ChartType.ALL
				? {
						enabled: true,
						y: {
							formatter: (value: number) => formatter.currency(value)
						}
					}
				: {
						custom: ({ dataPointIndex, w }): string => {
							const dataPoint = w?.config?.series?.[0]?.data?.[dataPointIndex] as {
								meta: { date: string; id: number };
								x: string;
								y: number;
							};

							const purpose = dataPoint.x;
							const amount = dataPoint.y;
							const date = new TZDate(dataPoint.meta.date);
							const id = dataPoint.meta.id;
							const tooltip = document.querySelector('.apexcharts-tooltip') as HTMLDivElement;

							if (id === selectedChartDataId) {
								selectedChartDataId = undefined;
								tooltip.style.display = 'none';

								return ``;
							}

							tooltip.style.display = 'block';
							selectedChartDataId = id;

							return `
								<div class="p-2 rounded-md text-center text-gray-900">
								<div class="font-bold">${purpose}</div>
								<div class="h-[1px] w-full bg-gray-300 my-2"></div>
								<div class="flex flex-row gap-2 items-center justify-start">
									<ion-icon icon="${cashOutline}"></ion-icon>
									<div>${formatter.currency(amount)}</div>
								</div>
								<div class="flex flex-row gap-2 items-center justify-start">
									<ion-icon icon="${calendarClearOutline}"></ion-icon>
									<div>${format(date, 'PPP')}</div>
								</div>
								</div>
							`;
						}
					}
	});

	function setSelectedChart(type: ChartType): void {
		selectedChart = type;
	}
</script>

<h1 class="mt-5 mb-2 text-center">{$t('components.widgets.budget-card.heading')}</h1>
{#if postings && postings.length > 0}
	<div class="flex items-center justify-center gap-2">
		{#if credits >= MINIMAL_POSTINGS_FOR_INTERACTION || debits >= MINIMAL_POSTINGS_FOR_INTERACTION}
			<Chip
				icon={cashOutline}
				label={$t('components.widgets.budget-card.all')}
				color="secondary"
				selected={selectedChart === ChartType.ALL}
				clicked={() => setSelectedChart(ChartType.ALL)}
			/>
			{#if credits}
				<Chip
					icon={trendingUp}
					label={$t('components.widgets.budget-card.credit')}
					color="success"
					selected={selectedChart === ChartType.CREDIT}
					clicked={() => setSelectedChart(ChartType.CREDIT)}
				/>
			{/if}
			{#if debits}
				<Chip
					icon={trendingDown}
					label={$t('components.widgets.budget-card.debit')}
					color="danger"
					selected={selectedChart === ChartType.DEBIT}
					clicked={() => setSelectedChart(ChartType.DEBIT)}
				/>
			{/if}
		{/if}
	</div>
	<div class="relative h-[350px]">
		{#if selectedChart === ChartType.ALL}
			<ion-text class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-7 text-center text-xl font-bold">
				{formatter.currency(getTotalBudget())}
			</ion-text>
		{/if}
		{#if chartSeries}
			{#key selectedChart}
				<Chart options={chartOptions}></Chart>
			{/key}
		{/if}
	</div>
{:else}
	<div class="text-medium mt-5 text-center">
		<ion-note>{$t('components.widgets.budget-card.no-postings')}</ion-note>
	</div>
{/if}
