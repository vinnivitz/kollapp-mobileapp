<script lang="ts">
	import type { ActivityTO, OrganizationBudgetCategoryResponseTO, PostingTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { startOfMonth, subMonths } from 'date-fns';
	import {
		alertCircleOutline,
		bulbOutline,
		calendarOutline,
		downloadOutline,
		informationCircleOutline,
		sparklesOutline,
		trendingDownOutline,
		trendingUpOutline,
		warningOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter, parser } from '$lib/utility';

	type Properties = {
		activities: ActivityTO[];
		categories: OrganizationBudgetCategoryResponseTO[];
		postings: PostingTO[];
		onDownload?: () => void;
	};

	type InsightType = 'danger' | 'info' | 'success' | 'warning';

	type Insight = {
		description: string;
		icon: string;
		id: string;
		title: string;
		type: InsightType;
		value?: string;
	};

	let { activities, categories, onDownload, postings }: Properties = $props();

	const MAX_VISIBLE_INSIGHTS = 6;
	const UNUSUAL_EXPENSE_MIN_COUNT = 10;
	const ANOMALY_STANDARD_DEVIATION_MULTIPLIER = 2;
	const EXPENSES_INCREASE_THRESHOLD_PERCENT = 30;
	const EXPENSES_DECREASE_THRESHOLD_PERCENT = -30;
	const TOP_CATEGORY_THRESHOLD_PERCENT = 40;
	const INACTIVE_DAYS_THRESHOLD = 30;
	const SMALL_POSTINGS_THRESHOLD_CENTS = 500;
	const SMALL_POSTINGS_MIN_COUNT = 10;

	const now = new TZDate();
	const currentMonthStart = startOfMonth(now);
	const previousMonthStart = startOfMonth(subMonths(now, 1));

	const monthlyStats = $derived.by(() => {
		const stats = new SvelteMap<string, { count: number; credit: number; debit: number }>();

		for (const posting of postings) {
			const date = new TZDate(posting.date);
			const monthKey = parser.date(startOfMonth(date));

			if (!stats.has(monthKey)) {
				stats.set(monthKey, { count: 0, credit: 0, debit: 0 });
			}

			const month = stats.get(monthKey)!;
			month.count++;
			if (posting.type === 'CREDIT') {
				month.credit += posting.amountInCents;
			} else {
				month.debit += posting.amountInCents;
			}
		}

		return stats;
	});

	const debitPostings = $derived(postings.filter((posting) => posting.type === 'DEBIT'));
	const totalDebit = $derived(debitPostings.reduce((sum, posting) => sum + posting.amountInCents, 0));

	const insights = $derived.by<Insight[]>(() => {
		const detectors = [
			detectUpcomingActivity,
			detectAnomaly,
			detectSpendingTrend,
			detectTopCategory,
			detectInactivity,
			detectSmallExpenses
		];

		return detectors
			.map((detect) => detect())
			.filter((insight) => !!insight)
			.slice(0, MAX_VISIBLE_INSIGHTS);
	});

	function detectUpcomingActivity(): Insight | undefined {
		const upcoming = activities.find((a) => {
			const activityDate = new TZDate(a.date);
			const daysUntil = Math.floor((activityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
			return daysUntil >= 0 && daysUntil <= 14;
		});
		if (!upcoming) return;

		const totalCost = (upcoming.activityPostings ?? [])
			.filter((p) => p.type === 'DEBIT')
			.reduce((sum, p) => sum + p.amountInCents, 0);

		return {
			description: $t('routes.organization.budget-statistics.page.smart-insights.upcoming-event.description', {
				value: upcoming.name,
				value2: formatter.currency(totalCost)
			}),
			icon: calendarOutline,
			id: 'upcoming-event',
			title: $t('routes.organization.budget-statistics.page.smart-insights.upcoming-event.title'),
			type: 'info',
			value: upcoming.name
		};
	}

	function detectAnomaly(): Insight | undefined {
		if (debitPostings.length < UNUSUAL_EXPENSE_MIN_COUNT) return;

		const amounts = debitPostings.map((posting) => posting.amountInCents);
		const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
		const standardDeviation = Math.sqrt(
			amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length
		);

		const anomalies = debitPostings.filter(
			(posting) => posting.amountInCents > average + ANOMALY_STANDARD_DEVIATION_MULTIPLIER * standardDeviation
		);
		if (anomalies.length === 0) return;

		const largest = anomalies.toSorted((a, b) => b.amountInCents - a.amountInCents)[0]!;
		return {
			description: $t('routes.organization.budget-statistics.page.insights.anomaly.description', {
				value: largest.purpose,
				value2: formatter.currency(largest.amountInCents),
				value3: formatter.currency(average)
			}),
			icon: alertCircleOutline,
			id: 'anomaly',
			title: $t('routes.organization.budget-statistics.page.insights.anomaly.title'),
			type: 'warning',
			value: `${((largest.amountInCents / average) * 100).toFixed(0)}%`
		};
	}

	function detectSpendingTrend(): Insight | undefined {
		const currentMonthKey = parser.date(currentMonthStart);
		const previousMonthKey = parser.date(previousMonthStart);
		const currentMonth = monthlyStats.get(currentMonthKey);
		const previousMonth = monthlyStats.get(previousMonthKey);

		if (!currentMonth || !previousMonth || previousMonth.debit === 0) return;

		const change = ((currentMonth.debit - previousMonth.debit) / previousMonth.debit) * 100;

		if (change > EXPENSES_INCREASE_THRESHOLD_PERCENT) {
			return {
				description: $t('routes.organization.budget-statistics.page.insights.spending-up.description', {
					value: Math.abs(change).toFixed(0)
				}),
				icon: trendingUpOutline,
				id: 'spending-up',
				title: $t('routes.organization.budget-statistics.page.insights.spending-up.title'),
				type: 'danger',
				value: `+${change.toFixed(0)}%`
			};
		}

		if (change < EXPENSES_DECREASE_THRESHOLD_PERCENT) {
			return {
				description: $t('routes.organization.budget-statistics.page.insights.spending-down.description', {
					value: Math.abs(change).toFixed(0)
				}),
				icon: trendingDownOutline,
				id: 'spending-down',
				title: $t('routes.organization.budget-statistics.page.insights.spending-down.title'),
				type: 'success',
				value: `${change.toFixed(0)}%`
			};
		}
	}

	function detectTopCategory(): Insight | undefined {
		const categoryExpenses = new SvelteMap<number, number>();
		for (const posting of debitPostings) {
			const current = categoryExpenses.get(posting.organizationBudgetCategoryId) ?? 0;
			categoryExpenses.set(posting.organizationBudgetCategoryId, current + posting.amountInCents);
		}

		const sorted = [...categoryExpenses.entries()].toSorted((a, b) => b[1] - a[1]);
		if (sorted.length === 0) return;

		const [topCategoryId, topAmount] = sorted[0]!;
		const topCategory = categories.find((category) => category.id === topCategoryId);
		const percentage = (topAmount / totalDebit) * 100;

		if (!topCategory || percentage <= TOP_CATEGORY_THRESHOLD_PERCENT) return;

		return {
			description: $t('routes.organization.budget-statistics.page.insights.top-category.description', {
				value: percentage.toFixed(0)
			}),
			icon: informationCircleOutline,
			id: 'top-category',
			title: $t('routes.organization.budget-statistics.page.insights.top-category.title'),
			type: 'info',
			value: topCategory.name
		};
	}

	function detectInactivity(): Insight | undefined {
		if (postings.length === 0) return;

		const lastPosting = [...postings].toSorted(
			(a, b) => new TZDate(b.date).getTime() - new TZDate(a.date).getTime()
		)[0]!;

		const daysWithoutActivity = Math.floor(
			(now.getTime() - new TZDate(lastPosting.date).getTime()) / (1000 * 60 * 60 * 24)
		);

		if (daysWithoutActivity <= INACTIVE_DAYS_THRESHOLD) return;

		return {
			description: $t('routes.organization.budget-statistics.page.insights.inactive.description', {
				value: daysWithoutActivity
			}),
			icon: warningOutline,
			id: 'inactive',
			title: $t('routes.organization.budget-statistics.page.insights.inactive.title'),
			type: 'warning',
			value: `${daysWithoutActivity}`
		};
	}

	function detectSmallExpenses(): Insight | undefined {
		const smallPostings = debitPostings.filter((p) => p.amountInCents < SMALL_POSTINGS_THRESHOLD_CENTS);
		if (smallPostings.length <= SMALL_POSTINGS_MIN_COUNT) return;

		const smallTotal = smallPostings.reduce((sum, p) => sum + p.amountInCents, 0);
		return {
			description: $t('routes.organization.budget-statistics.page.insights.small-expenses.description', {
				value: smallPostings.length,
				value2: formatter.currency(smallTotal)
			}),
			icon: bulbOutline,
			id: 'small-expenses',
			title: $t('routes.organization.budget-statistics.page.insights.small-expenses.title'),
			type: 'info'
		};
	}

	function getColorFromType(type: InsightType): string {
		switch (type) {
			case 'success': {
				return 'success';
			}
			case 'warning': {
				return 'warning';
			}
			case 'danger': {
				return 'danger';
			}
			default: {
				return 'secondary';
			}
		}
	}
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.insights.title')}
	titleIconStart={sparklesOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	{#if insights.length > 0}
		<div class="scrollbar-hide flex gap-3 overflow-x-auto px-2 pb-2">
			{#each insights as insight (insight.id)}
				<div
					class="flex max-w-65 min-w-50 shrink-0 flex-col gap-2 rounded-xl p-3"
					style="border: 1.5px solid var(--ion-color-{getColorFromType(
						insight.type
					)}); background: color-mix(in srgb, var(--ion-color-{getColorFromType(insight.type)}) 8%, transparent);"
				>
					<div class="flex items-center gap-2">
						<ion-icon icon={insight.icon} color={getColorFromType(insight.type)} class="text-lg"></ion-icon>
						<ion-text class="text-sm font-semibold">{insight.title}</ion-text>
						{#if insight.value}
							<ion-badge color={getColorFromType(insight.type)} class="ml-auto">
								{insight.value}
							</ion-badge>
						{/if}
					</div>
					<ion-note class="text-xs leading-snug">{insight.description}</ion-note>
				</div>
			{/each}
		</div>
	{:else}
		<div class="py-6 text-center text-gray-500">
			<ion-icon icon={sparklesOutline} class="mb-2 text-3xl text-gray-400"></ion-icon>
			<div class="text-sm">{$t('routes.organization.budget-statistics.page.insights.no-insights')}</div>
			<ion-note class="mt-1 text-xs">
				{$t('routes.organization.budget-statistics.page.insights.hint')}
			</ion-note>
		</div>
	{/if}
</Card>

<style>
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
