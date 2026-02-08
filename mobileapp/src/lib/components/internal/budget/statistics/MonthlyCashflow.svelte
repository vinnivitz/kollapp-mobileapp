<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { getYear, startOfMonth } from 'date-fns';
	import {
		cashOutline,
		chevronBackOutline,
		chevronForwardOutline,
		downloadOutline,
		thumbsDownOutline,
		thumbsUpOutline
	} from 'ionicons/icons';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	import { Button, Card, IconLabel } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		isDarkMode: boolean;
		postings: PostingTO[];
		onDownload?: () => void;
	};

	type MonthlyNetData = { credit: number; debit: number; month: string; monthKey: string; net: number };

	let { isDarkMode, onDownload, postings }: Properties = $props();

	const allMonthlyData = $derived.by<MonthlyNetData[]>(() => {
		const monthMap = new SvelteMap<string, MonthlyNetData>();

		for (const posting of postings) {
			const date = new TZDate(posting.date);
			const monthKey = formatter.date(startOfMonth(date), 'yyyy-MM');
			const monthLabel = formatter.date(date, 'MMM yyyy');

			if (!monthMap.has(monthKey)) {
				monthMap.set(monthKey, { credit: 0, debit: 0, month: monthLabel, monthKey, net: 0 });
			}

			const data = monthMap.get(monthKey)!;
			if (posting.type === 'CREDIT') {
				data.credit += posting.amountInCents;
			} else {
				data.debit += posting.amountInCents;
			}
			data.net = data.credit - data.debit;
		}

		return [...monthMap.entries()].toSorted(([a], [b]) => a.localeCompare(b)).map(([, data]) => data);
	});

	const availableYears = $derived.by(() => {
		if (postings.length === 0) return [];

		const years = new SvelteSet<number>();
		for (const posting of postings) {
			years.add(getYear(new TZDate(posting.date)));
		}

		return [...years].toSorted((a, b) => a - b);
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

	const monthlyData = $derived(allMonthlyData.filter((data) => data.monthKey.startsWith(selectedYear.toString())));

	const bestMonth = $derived.by(() => {
		if (monthlyData.length === 0) return;
		let best = monthlyData[0]!;
		for (const current of monthlyData) {
			if (current.net > best.net) {
				best = current;
			}
		}
		return best;
	});

	const worstMonth = $derived.by(() => {
		if (monthlyData.length === 0) return;
		let worst = monthlyData[0]!;
		for (const current of monthlyData) {
			if (current.net < worst.net) {
				worst = current;
			}
		}
		return worst;
	});

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 250,
			toolbar: { show: false },
			type: 'bar',
			zoom: { enabled: false }
		},
		colors: monthlyData.map((m) => (m.net >= 0 ? 'var(--ion-color-success)' : 'var(--ion-color-danger)')),
		dataLabels: { enabled: false },
		legend: { show: false },
		plotOptions: {
			bar: {
				borderRadius: 4,
				colors: {
					ranges: [
						{ color: 'var(--ion-color-danger)', from: -999_999_999, to: -0.01 },
						{ color: 'var(--ion-color-success)', from: 0, to: 999_999_999 }
					]
				},
				distributed: true
			}
		},
		series: [
			{
				data: monthlyData.map((m) => m.net / 100),
				name: $t('routes.organization.budget-statistics.page.cashflow.net')
			}
		],
		tooltip: {
			theme: isDarkMode ? 'dark' : 'light',
			y: {
				formatter: (value: number) => formatter.currency(value * 100)
			}
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
	title={$t('routes.organization.budget-statistics.page.cashflow.title')}
	titleIconStart={cashOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	<div class="mb-3 flex items-center justify-center gap-4">
		<Button fill="clear" size="small" disabled={!canGoBack} clicked={goToPreviousYear} icon={chevronBackOutline} />
		<span class="min-w-[60px] text-center text-lg font-semibold" style="color: var(--ion-text-color);">
			{selectedYear}
		</span>
		<Button fill="clear" size="small" disabled={!canGoForward} clicked={goToNextYear} icon={chevronForwardOutline} />
	</div>

	{#if monthlyData.length === 0}
		<ion-note class="text-center italic">
			{$t('routes.organization.budget-statistics.page.cashflow.no-data')}
		</ion-note>
	{:else}
		<Chart options={chartOptions}></Chart>

		<div class="mt-3 flex justify-around text-center text-xs">
			{#if bestMonth}
				<div>
					<IconLabel
						icon={thumbsUpOutline}
						color="medium"
						label={$t('routes.organization.budget-statistics.page.cashflow.best')}
					/>
					<div>
						<ion-text color="success" class="font-bold">
							{bestMonth.month}: {formatter.currency(bestMonth.net)}
						</ion-text>
					</div>
				</div>
			{/if}
			{#if worstMonth}
				<div>
					<IconLabel
						icon={thumbsDownOutline}
						color="medium"
						label={$t('routes.organization.budget-statistics.page.cashflow.worst')}
					/>
					<div>
						<ion-text color="danger" class="font-bold">
							{worstMonth.month}: {formatter.currency(worstMonth.net)}
						</ion-text>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</Card>
