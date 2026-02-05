<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { startOfMonth } from 'date-fns';
	import { statsChartOutline } from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { Card } from '$lib/components/widgets/ionic';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		isDarkMode: boolean;
		postings: PostingTO[];
	};

	type MonthlyData = { credit: number; debit: number; month: string };

	let { isDarkMode, postings }: Properties = $props();

	const monthlyData = $derived.by<MonthlyData[]>(() => {
		const monthMap = new SvelteMap<string, MonthlyData>();

		for (const posting of postings) {
			const date = new TZDate(posting.date);
			const monthKey = formatter.date(startOfMonth(date), 'yyyy-MM');
			const monthLabel = formatter.date(date, 'MMM yyyy');

			if (!monthMap.has(monthKey)) {
				monthMap.set(monthKey, { credit: 0, debit: 0, month: monthLabel });
			}

			const data = monthMap.get(monthKey)!;
			if (posting.type === 'CREDIT') {
				data.credit += posting.amountInCents;
			} else {
				data.debit += posting.amountInCents;
			}
		}

		return [...monthMap.entries()].toSorted(([a], [b]) => a.localeCompare(b)).map(([, data]) => data);
	});

	const trendChartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 250,
			stacked: false,
			toolbar: { show: false },
			type: 'area'
		},
		colors: ['var(--ion-color-success)', 'var(--ion-color-danger)'],
		dataLabels: { enabled: false },
		fill: {
			gradient: {
				opacityFrom: 0.5,
				opacityTo: 0.1
			},
			opacity: 0.3,
			type: 'gradient'
		},
		legend: {
			labels: {
				colors: 'var(--ion-color-dark)'
			},
			position: 'top',
			show: true
		},
		series: [
			{
				data: monthlyData.map((m) => m.credit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit')
			},
			{
				data: monthlyData.map((m) => m.debit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.debit')
			}
		],
		stroke: {
			curve: 'smooth',
			width: 2
		},
		tooltip: {
			theme: isDarkMode ? 'dark' : 'light'
		},
		xaxis: {
			categories: monthlyData.map((m) => m.month),
			labels: {
				rotate: -45,
				rotateAlways: true,
				style: {
					colors: 'var(--ion-color-dark)',
					fontSize: '10px'
				}
			}
		},
		yaxis: {
			labels: {
				formatter: (value: number) => formatter.currency(value * 100, true),
				style: {
					colors: 'var(--ion-color-dark)'
				}
			}
		}
	});
</script>

<Card title={$t('routes.organization.budget-statistics.page.trend.title')} titleIconStart={statsChartOutline} lazy>
	{#if monthlyData.length === 0}
		<ion-note class="text-center italic">{$t('routes.organization.budget-statistics.page.trend.no-data')}</ion-note>
	{:else}
		<Chart options={trendChartOptions}></Chart>
	{/if}
</Card>
