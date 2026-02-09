<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { getYear, startOfMonth } from 'date-fns';
	import { chevronBackOutline, chevronForwardOutline, downloadOutline, statsChartOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	import { Button, Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	let mounted = $state(false);
	onMount(() => (mounted = true));

	type Properties = {
		isDarkMode: boolean;
		postings: PostingTO[];
		onDownload?: () => void;
	};

	type MonthlyData = { credit: number; debit: number; month: string; monthKey: string };

	let { isDarkMode, onDownload, postings }: Properties = $props();

	const allMonthlyData = $derived.by<MonthlyData[]>(() => {
		const monthMap = new SvelteMap<string, MonthlyData>();

		for (const posting of postings) {
			const date = new TZDate(posting.date);
			const monthKey = formatter.date(startOfMonth(date), 'yyyy-MM');
			const monthLabel = formatter.date(date, 'MMM yyyy');

			if (!monthMap.has(monthKey)) {
				monthMap.set(monthKey, { credit: 0, debit: 0, month: monthLabel, monthKey });
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

	const availableYears = $derived.by(() => {
		if (postings.length === 0) return [];

		const years = new SvelteSet<number>();
		for (const posting of postings) {
			years.add(getYear(new TZDate(posting.date)));
		}

		return [...years].filter((year) => getMonthlyDataForYear(year).length >= 2).toSorted((a, b) => a - b);
	});

	let selectedYear = $state(getYear(new TZDate()));

	$effect(() => {
		if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
			selectedYear = availableYears.at(-1) ?? getYear(new TZDate());
		}
	});

	// eslint-disable-next-line sonarjs/index-of-compare-to-positive-number
	const canGoBack = $derived(availableYears.indexOf(selectedYear) > 0);
	const canGoForward = $derived(availableYears.indexOf(selectedYear) < availableYears.length - 1);

	function getMonthlyDataForYear(year: number): MonthlyData[] {
		return allMonthlyData.filter((data) => data.monthKey.startsWith(year.toString()));
	}

	function goToPreviousYear(): void {
		const currentIndex = availableYears.indexOf(selectedYear);
		if (currentIndex > 0) {
			selectedYear = availableYears[currentIndex - 1] ?? selectedYear;
		}
	}

	function goToNextYear(): void {
		const currentIndex = availableYears.indexOf(selectedYear);
		if (currentIndex < availableYears.length - 1) {
			selectedYear = availableYears[currentIndex + 1] ?? selectedYear;
		}
	}

	const monthlyData = $derived(getMonthlyDataForYear(selectedYear));

	const trendChartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 250,
			stacked: false,
			toolbar: { show: false },
			type: 'area',
			zoom: { enabled: false }
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

<Card
	title={$t('routes.organization.budget-statistics.page.trend.title')}
	titleIconStart={statsChartOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	<div class="mb-3 flex items-center justify-center gap-4">
		<Button fill="clear" size="small" disabled={!canGoBack} clicked={goToPreviousYear} icon={chevronBackOutline} />
		<span class="min-w-15 text-center text-lg font-semibold" style="color: var(--ion-text-color);">
			{selectedYear}
		</span>
		<Button fill="clear" size="small" disabled={!canGoForward} clicked={goToNextYear} icon={chevronForwardOutline} />
	</div>

	{#if monthlyData.length === 0}
		<ion-note class="text-center italic">{$t('routes.organization.budget-statistics.page.trend.no-data')}</ion-note>
	{:else if mounted}
		<Chart options={trendChartOptions}></Chart>
	{/if}
</Card>
