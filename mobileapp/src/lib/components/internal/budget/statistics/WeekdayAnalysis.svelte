<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { format, getDay } from 'date-fns';
	import { calendarOutline, downloadOutline } from 'ionicons/icons';

	import { Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		isDarkMode: boolean;
		postings: PostingTO[];
		onDownload?: () => void;
	};

	let { isDarkMode, onDownload, postings }: Properties = $props();

	const POLAR_COLORS = [
		'var(--ion-color-primary)',
		'var(--ion-color-secondary)',
		'var(--ion-color-tertiary)',
		'var(--ion-color-success)',
		'var(--ion-color-warning)',
		'var(--ion-color-danger)',
		'var(--ion-color-medium)'
	];

	const dayLabels = $derived(
		Array.from({ length: 7 }, (_, index) => {
			const referenceDate = new TZDate(2024, 0, 1 + index);
			return format(referenceDate, 'EEEE');
		})
	);

	const weekdayData = $derived.by(() => {
		const counts = Array.from({ length: 7 }, () => ({ count: 0, volume: 0 }));

		for (const posting of postings) {
			const date = new TZDate(posting.date);
			let dayIndex = getDay(date);
			// Convert Sunday=0 to Monday-based: Mo=0, Tu=1, ..., Su=6
			dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
			counts[dayIndex]!.count++;
			counts[dayIndex]!.volume += posting.amountInCents;
		}

		return counts;
	});

	const busiestDayIndex = $derived.by(() => {
		let maxIndex = 0;
		let maxCount = 0;
		for (const [index, weekdayDatum] of weekdayData.entries()) {
			if (weekdayDatum!.count > maxCount) {
				maxCount = weekdayDatum!.count;
				maxIndex = index;
			}
		}
		return maxIndex;
	});

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 300,
			toolbar: { show: false },
			type: 'polarArea'
		},
		colors: POLAR_COLORS,
		fill: {
			opacity: 0.8
		},
		labels: dayLabels,
		legend: {
			labels: { colors: 'var(--ion-color-dark)' },
			position: 'bottom',
			show: true
		},
		plotOptions: {
			polarArea: {
				rings: {
					strokeColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
					strokeWidth: 1
				},
				spokes: {
					connectorColors: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
					strokeWidth: 1
				}
			}
		},
		series: weekdayData.map((d) => d.count),
		stroke: {
			colors: ['var(--ion-background-color)'],
			width: 2
		},
		tooltip: {
			theme: isDarkMode ? 'dark' : 'light',
			y: {
				formatter: (value: number, { seriesIndex }) => {
					const vol = weekdayData[seriesIndex]?.volume ?? 0;
					return `${value} ${$t('routes.organization.budget-statistics.page.weekday.transactions-label')} (${formatter.currency(vol)})`;
				}
			}
		},
		yaxis: {
			show: false
		}
	});
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.weekday.title')}
	titleIconStart={calendarOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	{#if postings.length === 0}
		<div class="py-6 text-center">
			<ion-note>{$t('routes.organization.budget-statistics.page.weekday.no-data')}</ion-note>
		</div>
	{:else}
		<Chart options={chartOptions}></Chart>

		<div class="mt-2 text-center">
			<ion-note class="text-xs">
				{$t('routes.organization.budget-statistics.page.weekday.busiest', {
					value: dayLabels[busiestDayIndex],
					value2: weekdayData[busiestDayIndex]?.count
				})}
			</ion-note>
		</div>
	{/if}
</Card>
