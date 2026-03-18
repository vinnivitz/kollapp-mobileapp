<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import { endOfMonth, getYear, startOfMonth, subMonths } from 'date-fns';
	import {
		arrowDownOutline,
		arrowUpOutline,
		chevronBackOutline,
		chevronDownOutline,
		chevronForwardOutline,
		chevronUpOutline,
		downloadOutline,
		removeOutline,
		thumbsDownOutline,
		thumbsUpOutline,
		timeOutline
	} from 'ionicons/icons';
	import { tick } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	import DeferredChart from './DeferredChart.svelte';

	import { Button, Card, IconLabel, Popover } from '$lib/components/core';
	import { Datetime } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { DateTimePickerType } from '$lib/models/ui';
	import { formatter, withLoader } from '$lib/utility';

	type Properties = {
		isDarkMode: boolean;
		postings: PostingTO[];
		onDownload?: () => void;
	};

	type MonthlyData = {
		credit: number;
		debit: number;
		month: string;
		monthKey: string;
		net: number;
	};

	let { isDarkMode, onDownload, postings }: Properties = $props();

	let showComparison = $state<boolean>(false);

	const allMonthlyData = $derived.by<MonthlyData[]>(() => {
		const monthMap = new SvelteMap<string, MonthlyData>();

		for (const posting of postings) {
			const date = new TZDate(posting.date);
			const monthKey = formatter.date(startOfMonth(date), 'yyyy-MM');
			const monthLabel = formatter.date(date, 'MMM');

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

	let isNavigating = $state<boolean>(false);

	async function navigateYear(direction: 'back' | 'forward'): Promise<void> {
		const currentIndex = availableYears.indexOf(selectedYear);
		const nextIndex = direction === 'back' ? currentIndex - 1 : currentIndex + 1;
		const nextYear = availableYears[nextIndex];
		if (nextYear === undefined) return;

		isNavigating = true;
		await withLoader(async () => {
			selectedYear = nextYear;
			await tick();
			await new Promise((r) => requestAnimationFrame(r));
		});
		isNavigating = false;
	}

	const monthlyData = $derived(allMonthlyData.filter((data) => data.monthKey.startsWith(selectedYear.toString())));

	const bestMonth = $derived.by(() => {
		if (monthlyData.length === 0) return;
		let best = monthlyData[0]!;
		for (const m of monthlyData) {
			if (m.net > best.net) best = m;
		}
		return best;
	});

	const worstMonth = $derived.by(() => {
		if (monthlyData.length === 0) return;
		let worst = monthlyData[0]!;
		for (const m of monthlyData) {
			if (m.net < worst.net) worst = m;
		}
		return worst;
	});

	const now = new TZDate();
	let comparisonMonthA = $state<string>(formatter.date(startOfMonth(now), 'yyyy-MM'));
	let comparisonMonthB = $state<string>(formatter.date(startOfMonth(subMonths(now, 1)), 'yyyy-MM'));

	let popoverAOpen = $state<boolean>(false);
	let popoverBOpen = $state<boolean>(false);

	const comparisonMonthAStart = $derived(startOfMonth(new TZDate(`${comparisonMonthA}-01`)));
	const comparisonMonthAEnd = $derived(endOfMonth(new TZDate(`${comparisonMonthA}-01`)));
	const comparisonMonthBStart = $derived(startOfMonth(new TZDate(`${comparisonMonthB}-01`)));
	const comparisonMonthBEnd = $derived(endOfMonth(new TZDate(`${comparisonMonthB}-01`)));

	const comparison = $derived.by(() => {
		const currentMonthPostings = postings.filter((posting) => {
			const date = new TZDate(posting.date);
			return date >= comparisonMonthAStart && date <= comparisonMonthAEnd;
		});

		const previousMonthPostings = postings.filter((posting) => {
			const date = new TZDate(posting.date);
			return date >= comparisonMonthBStart && date <= comparisonMonthBEnd;
		});

		const currentCredit = currentMonthPostings
			.filter((p) => p.type === 'CREDIT')
			.reduce((sum, p) => sum + p.amountInCents, 0);
		const currentDebit = currentMonthPostings
			.filter((p) => p.type === 'DEBIT')
			.reduce((sum, p) => sum + p.amountInCents, 0);
		const previousCredit = previousMonthPostings
			.filter((p) => p.type === 'CREDIT')
			.reduce((sum, p) => sum + p.amountInCents, 0);
		const previousDebit = previousMonthPostings
			.filter((p) => p.type === 'DEBIT')
			.reduce((sum, p) => sum + p.amountInCents, 0);

		const creditChange = previousCredit > 0 ? ((currentCredit - previousCredit) / previousCredit) * 100 : 0;
		const debitChange = previousDebit > 0 ? ((currentDebit - previousDebit) / previousDebit) * 100 : 0;
		const currentBalance = currentCredit - currentDebit;
		const previousBalance = previousCredit - previousDebit;
		const balanceChange =
			previousBalance === 0 ? 0 : ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100;

		return {
			balanceChange,
			creditChange,
			currentCredit,
			currentDebit,
			debitChange,
			previousCredit,
			previousDebit
		};
	});

	function getChangeIcon(change: number): string {
		if (change > 0) return arrowUpOutline;
		if (change < 0) return arrowDownOutline;
		return removeOutline;
	}

	function getChangeColor(change: number, isDebit: boolean): Colors {
		if (change === 0) return 'medium';
		if (isDebit) return change > 0 ? 'danger' : 'success';
		return change > 0 ? 'success' : 'danger';
	}

	function formatChange(change: number): string {
		const sign = change > 0 ? '+' : '';
		return `${sign}${change.toFixed(1)}%`;
	}

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 280,
			stacked: false,
			toolbar: { show: false },
			type: 'line',
			zoom: { enabled: false }
		},
		colors: ['var(--ion-color-success)', 'var(--ion-color-danger)', 'var(--ion-color-primary)'],
		dataLabels: { enabled: false },
		fill: {
			opacity: [0.85, 0.85, 1]
		},
		legend: {
			labels: { colors: 'var(--ion-color-dark)' },
			position: 'top',
			show: true
		},
		plotOptions: {
			bar: {
				borderRadius: 3,
				columnWidth: '60%'
			}
		},
		series: [
			{
				data: monthlyData.map((m) => m.credit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit'),
				type: 'column'
			},
			{
				data: monthlyData.map((m) => m.debit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.debit'),
				type: 'column'
			},
			{
				data: monthlyData.map((m) => m.net / 100),
				name: $t('routes.organization.budget-statistics.page.cashflow.net'),
				type: 'line'
			}
		],
		stroke: {
			curve: 'smooth',
			width: [0, 0, 3]
		},
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
				style: { colors: 'var(--ion-color-dark)' }
			}
		}
	});
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.trend.title')}
	titleIconStart={timeOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
	lazyHeight="480px"
>
	<div class="mb-3 flex items-center justify-center gap-4">
		<Button
			fill="clear"
			size="small"
			disabled={!canGoBack || isNavigating}
			clicked={() => void navigateYear('back')}
			icon={chevronBackOutline}
		/>
		<span class="min-w-15 text-center text-lg font-semibold" style="color: var(--ion-text-color);">
			{selectedYear}
		</span>
		<Button
			fill="clear"
			size="small"
			disabled={!canGoForward || isNavigating}
			clicked={() => void navigateYear('forward')}
			icon={chevronForwardOutline}
		/>
	</div>

	{#if monthlyData.length === 0}
		<ion-note class="block text-center italic"
			>{$t('routes.organization.budget-statistics.page.trend.no-data')}</ion-note
		>
	{:else}
		<DeferredChart options={chartOptions} />

		<div class="mt-2 flex justify-around text-center text-xs">
			{#if bestMonth}
				<div>
					<IconLabel
						icon={thumbsUpOutline}
						color="medium"
						label={$t('routes.organization.budget-statistics.page.cashflow.best')}
					/>
					<ion-text color="success" class="font-bold">
						{bestMonth.month}: {formatter.currency(bestMonth.net)}
					</ion-text>
				</div>
			{/if}
			{#if worstMonth}
				<div>
					<IconLabel
						icon={thumbsDownOutline}
						color="medium"
						label={$t('routes.organization.budget-statistics.page.cashflow.worst')}
					/>
					<ion-text color="danger" class="font-bold">
						{worstMonth.month}: {formatter.currency(worstMonth.net)}
					</ion-text>
				</div>
			{/if}
		</div>

		<div class="mt-3 border-t border-(--ion-color-light) pt-2">
			<button
				class="flex w-full cursor-pointer items-center justify-center gap-1 border-none bg-transparent py-1"
				onclick={() => (showComparison = !showComparison)}
			>
				<ion-text color="medium" class="text-sm font-semibold">
					{$t('routes.organization.budget-statistics.page.comparison.title')}
				</ion-text>
				<ion-icon icon={showComparison ? chevronUpOutline : chevronDownOutline} color="medium" class="text-sm"
				></ion-icon>
			</button>

			{#if showComparison}
				<div class="animate-slide-down mt-2">
					<div class="flex items-center justify-center gap-2 px-2">
						<Button
							fill="outline"
							size="small"
							color="medium"
							label={formatter.date(comparisonMonthAStart, 'MMM yyyy')}
							clicked={() => (popoverAOpen = true)}
						/>
						<ion-note class="text-xs">vs.</ion-note>
						<Button
							fill="outline"
							size="small"
							color="medium"
							label={formatter.date(comparisonMonthBStart, 'MMM yyyy')}
							clicked={() => (popoverBOpen = true)}
						/>
					</div>

					<Popover open={popoverAOpen} extended dismissed={() => (popoverAOpen = false)}>
						<div class="text-center">
							<Datetime
								type={DateTimePickerType.MONTH_YEAR}
								value={`${comparisonMonthA}-01`}
								showButtons={false}
								showTitle={false}
								applied={(nextValue) => {
									comparisonMonthA = nextValue.slice(0, 7);
									popoverAOpen = false;
								}}
							/>
						</div>
					</Popover>
					<Popover open={popoverBOpen} extended dismissed={() => (popoverBOpen = false)}>
						<div class="text-center">
							<Datetime
								type={DateTimePickerType.MONTH_YEAR}
								value={`${comparisonMonthB}-01`}
								showButtons={false}
								showTitle={false}
								applied={(nextValue) => {
									comparisonMonthB = nextValue.slice(0, 7);
									popoverBOpen = false;
								}}
							/>
						</div>
					</Popover>

					<div class="mt-3 grid grid-cols-2 gap-3 px-2">
						{@render comparisonCard(
							$t('routes.organization.budget-statistics.page.comparison.credit'),
							comparison.currentCredit,
							comparison.previousCredit,
							comparison.creditChange,
							false
						)}
						{@render comparisonCard(
							$t('routes.organization.budget-statistics.page.comparison.debit'),
							comparison.currentDebit,
							comparison.previousDebit,
							comparison.debitChange,
							true
						)}
					</div>

					<div class="mt-3 text-center">
						<ion-note class="text-xs"
							>{$t('routes.organization.budget-statistics.page.comparison.balance-trend')}</ion-note
						>
						<IconLabel
							icon={getChangeIcon(comparison.balanceChange)}
							label={formatChange(comparison.balanceChange)}
							color={getChangeColor(comparison.balanceChange, false)}
							size="xl"
							bold
						/>
						{#if comparison.balanceChange > 0}
							<ion-text color="success" class="text-xs">
								{$t('routes.organization.budget-statistics.page.comparison.improving')}
							</ion-text>
						{:else if comparison.balanceChange < 0}
							<ion-text color="danger" class="text-xs">
								{$t('routes.organization.budget-statistics.page.comparison.declining')}
							</ion-text>
						{:else}
							<ion-text color="medium" class="text-xs">
								{$t('routes.organization.budget-statistics.page.comparison.stable')}
							</ion-text>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</Card>

{#snippet comparisonCard(label: string, current: number, previous: number, change: number, isDebit: boolean)}
	<div
		class="rounded-lg p-3 text-center"
		style="border: 1px solid var(--ion-color-{isDebit
			? 'danger'
			: 'success'}); background: color-mix(in srgb, var(--ion-color-{isDebit ? 'danger' : 'success'}) 6%, transparent);"
	>
		<ion-note class="text-xs">{label}</ion-note>
		<div class="mt-1">
			<ion-text color={isDebit ? 'danger' : 'success'} class="text-lg font-bold">
				{formatter.currency(current)}
			</ion-text>
		</div>
		{#if previous > 0}
			<IconLabel
				icon={getChangeIcon(change)}
				label={formatChange(change)}
				color={getChangeColor(change, isDebit)}
				size="xs"
			/>
			<ion-note class="text-[10px]">
				{$t('routes.organization.budget-statistics.page.comparison.previous', {
					value: formatter.date(comparisonMonthBStart, 'MMM')
				})}: {formatter.currency(previous)}
			</ion-note>
		{/if}
	</div>
{/snippet}

<style>
	.animate-slide-down {
		animation: slideDown 200ms ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
