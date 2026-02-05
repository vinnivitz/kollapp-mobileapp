<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { addDays, eachDayOfInterval, endOfMonth, format, getDay, getYear, startOfMonth } from 'date-fns';
	import { chevronBackOutline, chevronForwardOutline, flameOutline } from 'ionicons/icons';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	import { Button, Card } from '$lib/components/widgets/ionic';
	import { t } from '$lib/locales';
	import { formatter, getBlendedColorFromVariable, getHexFromVariable } from '$lib/utility';

	type Properties = {
		postings: PostingTO[];
	};

	type DayData = {
		count: number;
		credit: number;
		date: TZDate;
		debit: number;
		total: number;
	};

	let { postings }: Properties = $props();

	const availableYears = $derived.by(() => {
		if (postings.length === 0) return [getYear(new TZDate())];

		const years = new SvelteSet<number>();
		for (const posting of postings) {
			years.add(getYear(new TZDate(posting.date)));
		}

		const sortedYears = [...years].toSorted((a, b) => a - b);
		const minYear = sortedYears[0] ?? getYear(new TZDate());
		const maxYear = sortedYears.at(-1) ?? getYear(new TZDate());

		const allYears: number[] = [];
		for (let y = minYear; y <= maxYear; y++) {
			allYears.push(y);
		}
		return allYears;
	});

	let selectedYear = $state(getYear(new TZDate()));

	$effect(() => {
		if (!availableYears.includes(selectedYear)) {
			selectedYear = availableYears.at(-1) ?? getYear(new TZDate());
		}
	});

	const canGoBack = $derived(availableYears.includes(selectedYear));
	const canGoForward = $derived(availableYears.indexOf(selectedYear) < availableYears.length - 1);

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

	const startDate = $derived(startOfMonth(new TZDate(selectedYear, 0, 1)));
	const endDate = $derived(endOfMonth(new TZDate(selectedYear, 11, 31)));

	const dailyData = $derived.by<Map<string, DayData>>(() => {
		const map = new SvelteMap<string, DayData>();
		const start = startDate;
		const end = endDate;

		const allDays = eachDayOfInterval({ end, start });
		for (const day of allDays) {
			const key = format(day, 'yyyy-MM-dd');
			map.set(key, {
				count: 0,
				credit: 0,
				date: new TZDate(day),
				debit: 0,
				total: 0
			});
		}

		for (const posting of postings) {
			const postingDate = new TZDate(posting.date);
			const key = format(postingDate, 'yyyy-MM-dd');
			const data = map.get(key);
			if (data) {
				data.count++;
				if (posting.type === 'CREDIT') {
					data.credit += posting.amountInCents;
					data.total += posting.amountInCents;
				} else {
					data.debit += posting.amountInCents;
					data.total -= posting.amountInCents;
				}
			}
		}

		return map;
	});

	const weeks = $derived.by<DayData[][]>(() => {
		const result: DayData[][] = [];
		let currentWeek: DayData[] = [];
		const start = startDate;
		const end = endDate;

		const firstDay = start;
		const dayOfWeek = getDay(firstDay);
		const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		let current = addDays(firstDay, mondayOffset);

		while (current <= end || currentWeek.length > 0) {
			const key = format(current, 'yyyy-MM-dd');
			const data = dailyData.get(key);

			if (data) {
				currentWeek.push(data);
			} else {
				currentWeek.push({
					count: 0,
					credit: 0,
					date: new TZDate(current),
					debit: 0,
					total: 0
				});
			}

			if (currentWeek.length === 7) {
				result.push(currentWeek);
				currentWeek = [];
			}

			current = addDays(current, 1);

			if (current > end && currentWeek.length === 0) break;
		}

		if (currentWeek.length > 0) {
			result.push(currentWeek);
		}

		return result;
	});

	const heatmapSeries = $derived.by(() => {
		const series: { data: { x: string; y: number; meta?: DayData }[]; name: string }[] = [];
		const dayLabels = Array.from({ length: 7 }, (_, index) => {
			const referenceDate = new Date(2024, 0, 1 + index);
			return format(referenceDate, 'EEEEEE');
		});

		for (let dayIndex = 6; dayIndex >= 0; dayIndex--) {
			const dayName = dayLabels[dayIndex] ?? 'Mo';
			const dayData: { x: string; y: number; meta?: DayData }[] = [];
			const start = startDate;
			const end = endDate;

			for (const week of weeks) {
				const day = week[dayIndex];
				if (day) {
					const dayTime = day.date.getTime();
					const isInRange = dayTime >= start.getTime() && dayTime <= end.getTime();
					const weekLabel = format(week[0]?.date ?? day.date, 'MMM yy');
					const netValue = (day.credit - day.debit) / 100;
					dayData.push({
						meta: day,
						x: weekLabel,
						y: isInRange ? netValue : -999_999
					});
				}
			}

			series.push({ data: dayData, name: dayName });
		}

		return series;
	});

	const chartWidth = $derived(Math.max(weeks.length * 30, 600));

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			events: {
				dataPointSelection: (_event, _chartContext, config) => {
					console.log('jo');
					const seriesData = heatmapSeries[config.seriesIndex]?.data[config.dataPointIndex];
					if (seriesData?.y === -999_999) {
						// Klick auf out-of-range Zelle verhindern
						return false;
					}
				}
			},
			height: 250,
			toolbar: { show: false },
			type: 'heatmap',
			width: chartWidth
		},
		dataLabels: { enabled: false },
		legend: { show: false },
		plotOptions: {
			heatmap: {
				colorScale: {
					inverse: false,
					ranges: [
						{
							color: getHexFromVariable('--ion-color-medium'),
							from: -999_999,
							name: 'out-of-range',
							to: -999_998
						},
						{
							color: getHexFromVariable('--ion-color-danger'),
							from: -999_997,
							name: 'high-expense',
							to: -200.01
						},
						{
							color: getBlendedColorFromVariable('--ion-color-danger-rgb', 0.8),
							from: -200,
							name: 'medium-high-expense',
							to: -100.01
						},
						{
							color: getBlendedColorFromVariable('--ion-color-danger-rgb', 0.7),
							from: -100,
							name: 'medium-expense',
							to: -50.01
						},
						{
							color: getBlendedColorFromVariable('--ion-color-danger-rgb', 0.6),
							from: -50,
							name: 'medium-low-expense',
							to: -10.01
						},
						{
							color: getBlendedColorFromVariable('--ion-color-danger-rgb', 0.5),
							from: -10,
							name: 'low-expense',
							to: -0.01
						},
						{
							color: getHexFromVariable('--ion-color-light'),
							from: 0,
							name: 'neutral',
							to: 0
						},
						{
							color: getBlendedColorFromVariable('--ion-color-success-rgb', 0.5),
							from: 0.01,
							name: 'low-income',
							to: 10
						},
						{
							color: getBlendedColorFromVariable('--ion-color-success-rgb', 0.6),
							from: 10.01,
							name: 'medium-low-income',
							to: 50
						},
						{
							color: getBlendedColorFromVariable('--ion-color-success-rgb', 0.7),
							from: 50.01,
							name: 'medium-income',
							to: 100
						},
						{
							color: getBlendedColorFromVariable('--ion-color-success-rgb', 0.9),
							from: 100.01,
							name: 'medium-high-income',
							to: 200
						},
						{
							color: getHexFromVariable('--ion-color-success'),
							from: 200.01,
							name: 'high-income',
							to: 999_999
						}
					]
				},
				enableShades: false,
				radius: 2,
				shadeIntensity: 0
			}
		},
		series: heatmapSeries,
		stroke: {
			colors: ['var(--ion-background-color)'],
			width: 2
		},
		tooltip: {
			custom: ({ dataPointIndex, seriesIndex, w }) => {
				const seriesData = w.config.series[seriesIndex]?.data[dataPointIndex];
				if (!seriesData) return '';

				const yValue = seriesData.y;
				if (yValue === -999_999) return '';

				const data = seriesData.meta as DayData | undefined;
				if (!data) return '';

				const dateString = format(data.date, 'PPP');
				const hasTransactions = data.count > 0;

				return `
					<div style="padding: 8px 12px; background: var(--ion-background-color); border: 1px solid var(--ion-color-light); border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
						<div style="font-weight: 600; color: var(--ion-text-color); margin-bottom: 4px;">${dateString}</div>
						${
							hasTransactions
								? `
							<div style="display: flex; flex-direction: column; gap: 2px; font-size: 12px;">
								<span style="color: var(--ion-color-success);">+${formatter.currency(data.credit)}</span>
								<span style="color: var(--ion-color-danger);">-${formatter.currency(data.debit)}</span>
								<span style="color: var(--ion-color-medium);">${data.count} Transaktionen</span>
							</div>
						`
								: `<div style="color: var(--ion-color-medium); font-size: 12px;">Keine Transaktionen</div>`
						}
					</div>
				`;
			}
		},
		xaxis: {
			labels: {
				rotate: -45,
				rotateAlways: true,
				show: true,
				style: {
					colors: 'var(--ion-color-dark)',
					fontSize: '9px'
				}
			},
			tickAmount: Math.min(weeks.length, 12)
		},
		yaxis: {
			labels: {
				style: {
					colors: 'var(--ion-color-dark)',
					fontSize: '10px'
				}
			}
		}
	});

	const totalDays = $derived([...dailyData.values()].filter((d) => d.count > 0).length);
	const busiestDay = $derived.by(() => {
		let max: DayData | undefined;
		for (const data of dailyData.values()) {
			const totalVolume = data.credit + data.debit;
			const maxVolume = max ? max.credit + max.debit : 0;
			if (!max || totalVolume > maxVolume) max = data;
		}
		return max;
	});

	let chartContainer = $state<HTMLElement>();

	function handleClickOutside(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		const isHeatmapCell = target.closest('.apexcharts-heatmap-rect');
		if (!isHeatmapCell && chartContainer) {
			const activeRects = chartContainer.querySelectorAll('.apexcharts-heatmap-rect[selected="true"]');
			for (const rect of activeRects) rect.removeAttribute('selected');
			const allRects = chartContainer.querySelectorAll('.apexcharts-heatmap-rect');
			for (const rect of allRects) {
				rect.setAttribute('filter', 'none');
				rect.classList.remove('apexcharts-selected');
			}
		}
	}
</script>

<svelte:document onclick={handleClickOutside} />

<Card
	title={$t('routes.organization.budget-statistics.page.heatmap.title')}
	titleIconStart={flameOutline}
	lazy
	classList="text-center"
>
	<div class="mb-3 flex items-center justify-center gap-4">
		<Button fill="clear" size="small" disabled={!canGoBack} clicked={goToPreviousYear} icon={chevronBackOutline} />
		<span class="min-w-[60px] text-center text-lg font-semibold" style="color: var(--ion-text-color);">
			{selectedYear}
		</span>
		<Button fill="clear" size="small" disabled={!canGoForward} clicked={goToNextYear} icon={chevronForwardOutline} />
	</div>

	{#if busiestDay && busiestDay.count > 0}
		<ion-note class="text-center text-xs">
			{$t('routes.organization.budget-statistics.page.heatmap.busiest-day', {
				value: format(busiestDay.date, 'PPP'),
				value2: formatter.currency(busiestDay.credit + busiestDay.debit)
			})}
		</ion-note>
	{/if}
	<div class="mt-3 flex items-center justify-between text-xs" style="color: var(--ion-color-medium);">
		<div class="flex items-center gap-1">
			<span>{$t('routes.organization.budget-statistics.page.heatmap.expenses')}</span>
			<div class="h-3 w-3 rounded-sm" style="background: {getHexFromVariable('--ion-color-danger')};"></div>
			<div
				class="h-3 w-3 rounded-sm"
				style="background: {getBlendedColorFromVariable('--ion-color-danger-rgb', 0.5)};"
			></div>
			<div class="h-3 w-3 rounded-sm" style="background: {getHexFromVariable('--ion-color-light')};"></div>
			<div
				class="h-3 w-3 rounded-sm"
				style="background: {getBlendedColorFromVariable('--ion-color-success-rgb', 0.5)};"
			></div>
			<div class="h-3 w-3 rounded-sm" style="background: {getHexFromVariable('--ion-color-success')};"></div>
			<span>{$t('routes.organization.budget-statistics.page.heatmap.income')}</span>
		</div>
		<div>
			{$t('routes.organization.budget-statistics.page.heatmap.active-days', { value: totalDays })}
		</div>
	</div>
	<div class="chart-scroll-container" style="min-width: 100%;" bind:this={chartContainer}>
		<div style="width: {chartWidth}px; min-width: 100%;">
			<Chart options={chartOptions} />
		</div>
	</div>
</Card>

<style>
	.chart-scroll-container {
		overflow-x: auto;
		overflow-y: visible;
		padding-top: 80px;
		margin-top: -80px;
		padding-bottom: 20px;
	}
</style>
