<script lang="ts">
	import type { PostingTO, PostingType } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { format } from 'date-fns';
	import { calendarOutline, cashOutline, trendingDown, trendingUp } from 'ionicons/icons';

	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import { formatter } from '$lib/utility';

	enum ChartType {
		ALL,
		CREDIT,
		DEBIT
	}

	let { postings }: { postings?: PostingTO[] } = $props();

	let selectedChart = $state<ChartType>(ChartType.ALL);
	let chartSeries = $state<ApexAxisChartSeries | ApexNonAxisChartSeries>();
	let labels = $state<string[]>();
	let colors = $state<string[]>();
	let selectedChartDataId = $state<number>();

	const hasDebit = $derived(postings?.some((posting) => posting.type === 'DEBIT') ?? false);

	const hasCredit = $derived(postings?.some((postings) => postings.type === 'CREDIT') ?? false);

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
				chartSeries = [
					credits.reduce((accumulator, credit) => accumulator + credit.amountInCents, 0),
					debits.reduce((accumulator, debit) => accumulator + debit.amountInCents, 0)
				];
				colors = ['var(--ion-color-success-tint)', 'var(--ion-color-danger-tint)'];
				labels = ['Income', 'Expenses'];
				break;
			}
		}
	});

	const chartOptions = $derived<ApexOptions>({
		chart: {
			events: {
				dataPointSelection: (_event, _chartContext, options) => {
					const clickedIndex = options.dataPointIndex ?? 0;

					const metaType = options?.w?.config?.series?.[0]?.data?.[clickedIndex]?.meta?.type as PostingType | undefined;

					if (selectedChart !== ChartType.ALL) return;

					let target: ChartType | undefined;

					if (metaType === 'CREDIT' || metaType === 'DEBIT') {
						target = metaType === 'CREDIT' ? ChartType.CREDIT : ChartType.DEBIT;
					} else if (clickedIndex === 0) {
						target = ChartType.CREDIT;
					} else if (clickedIndex === 1) {
						target = ChartType.DEBIT;
					}

					if (target !== undefined) {
						setTimeout(() => setSelectedChart(target), 0);
					}
				}
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
		tooltip:
			selectedChart === ChartType.ALL
				? { enabled: true }
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

							if (id === selectedChartDataId) {
								selectedChartDataId = undefined;
								return ``;
							}

							selectedChartDataId = id;

							return `
								<div class="p-2 rounded-md text-center">
								<div class="font-bold">${purpose}</div>
								<div class="h-[1px] w-full bg-gray-300 my-2"></div>
								<div class="flex flex-row gap-2 items-center justify-start">
									<ion-icon icon="${cashOutline}"></ion-icon>
									<div>${formatter.currency(amount)}</div>
								</div>
								<div class="flex flex-row gap-2 items-center justify-start">
									<ion-icon icon="${calendarOutline}"></ion-icon>
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

<div class="mt-5 mb-2 text-center text-2xl">Budget overview</div>
<div class="flex items-center justify-center gap-2">
	{#if hasCredit && hasDebit}
		<Chip
			icon={cashOutline}
			label="All"
			color="secondary"
			selected={selectedChart === ChartType.ALL}
			clicked={() => setSelectedChart(ChartType.ALL)}
		/>
		<Chip
			icon={trendingUp}
			label="Income"
			color="success"
			selected={selectedChart === ChartType.CREDIT}
			clicked={() => setSelectedChart(ChartType.CREDIT)}
		/>
		<Chip
			icon={trendingDown}
			label="Expenses"
			color="danger"
			selected={selectedChart === ChartType.DEBIT}
			clicked={() => setSelectedChart(ChartType.DEBIT)}
		/>
	{/if}
</div>
<div class="relative h-[350px]">
	{#if selectedChart === ChartType.ALL}
		<ion-text class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-7 text-center text-xl font-bold">
			{formatter.currency(getTotalBudget())}
		</ion-text>
	{/if}
	{#key selectedChart}
		<Chart options={chartOptions}></Chart>
	{/key}
</div>
