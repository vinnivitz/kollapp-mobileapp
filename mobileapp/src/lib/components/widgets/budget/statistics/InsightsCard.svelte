<script lang="ts">
	import type { OrganizationBudgetCategoryResponseTO, PostingTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { format, startOfMonth, subMonths } from 'date-fns';
	import {
		alertCircleOutline,
		bulbOutline,
		checkmarkCircleOutline,
		informationCircleOutline,
		sparklesOutline,
		trendingDownOutline,
		trendingUpOutline,
		warningOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { Card } from '$lib/components/widgets/ionic';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		categories: OrganizationBudgetCategoryResponseTO[];
		postings: PostingTO[];
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

	let { categories, postings }: Properties = $props();

	const UNUSUAL_EXPENSE_MIN_COUNT = 10;
	const ANOMALY_STANDARD_DEVIATION_MULTIPLIER = 2;
	const SPENDING_INCREASE_THRESHOLD_PERCENT = 30;
	const SPENDING_DECREASE_THRESHOLD_PERCENT = -30;
	const TOP_CATEGORY_THRESHOLD_PERCENT = 40;
	const SAVINGS_RATIO_THRESHOLD = 1.2;
	const INACTIVE_DAYS_THRESHOLD = 30;
	const SMALL_TRANSACTION_THRESHOLD_CENTS = 500;
	const SMALL_TRANSACTIONS_MIN_COUNT = 10;

	const now = new TZDate();
	const currentMonthStart = startOfMonth(now);
	const previousMonthStart = startOfMonth(subMonths(now, 1));

	const monthlyStats = $derived.by(() => {
		const stats = new SvelteMap<string, { count: number; credit: number; debit: number }>();

		for (const posting of postings) {
			const date = new TZDate(posting.date);
			const monthKey = format(startOfMonth(date), 'yyyy-MM');

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
	const totalCredit = $derived(
		postings.filter((posting) => posting.type === 'CREDIT').reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	function detectAnomalyInsight(): Insight | undefined {
		if (debitPostings.length < UNUSUAL_EXPENSE_MIN_COUNT) return;

		const amounts = debitPostings.map((posting) => posting.amountInCents);
		const average = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
		const standardDeviation = Math.sqrt(amounts.reduce((sum, a) => sum + Math.pow(a - average, 2), 0) / amounts.length);

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

	function detectSpendingTrendInsight(): Insight | undefined {
		const currentMonthKey = format(currentMonthStart, 'yyyy-MM');
		const previousMonthKey = format(previousMonthStart, 'yyyy-MM');
		const currentMonth = monthlyStats.get(currentMonthKey);
		const previousMonth = monthlyStats.get(previousMonthKey);

		if (!currentMonth || !previousMonth || previousMonth.debit === 0) return;

		const change = ((currentMonth.debit - previousMonth.debit) / previousMonth.debit) * 100;

		if (change > SPENDING_INCREASE_THRESHOLD_PERCENT) {
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

		if (change < SPENDING_DECREASE_THRESHOLD_PERCENT) {
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

	function detectTopCategoryInsight(): Insight | undefined {
		if (categories.length === 0) return;

		const categorySpending = new SvelteMap<number, number>();
		for (const posting of debitPostings) {
			const current = categorySpending.get(posting.organizationBudgetCategoryId) ?? 0;
			categorySpending.set(posting.organizationBudgetCategoryId, current + posting.amountInCents);
		}

		const sorted = [...categorySpending.entries()].toSorted((a, b) => b[1] - a[1]);
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

	function detectSavingsInsight(): Insight | undefined {
		if (totalCredit <= totalDebit * SAVINGS_RATIO_THRESHOLD) return;

		return {
			description: $t('routes.organization.budget-statistics.page.insights.savings.description', {
				value: formatter.currency(totalCredit - totalDebit)
			}),
			icon: checkmarkCircleOutline,
			id: 'savings',
			title: $t('routes.organization.budget-statistics.page.insights.savings.title'),
			type: 'success',
			value: formatter.currency(totalCredit - totalDebit)
		};
	}

	function detectInactivityInsight(): Insight | undefined {
		if (postings.length === 0) return;

		const lastPosting = [...postings].toSorted(
			(a, b) => new TZDate(b.date).getTime() - new TZDate(a.date).getTime()
		)[0];
		if (!lastPosting) return;

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

	function detectSmallExpensesInsight(): Insight | undefined {
		const smallTransactions = debitPostings.filter((p) => p.amountInCents < SMALL_TRANSACTION_THRESHOLD_CENTS);
		if (smallTransactions.length <= SMALL_TRANSACTIONS_MIN_COUNT) return;

		const smallTotal = smallTransactions.reduce((sum, p) => sum + p.amountInCents, 0);
		return {
			description: $t('routes.organization.budget-statistics.page.insights.small-expenses.description', {
				value: smallTransactions.length,
				value2: formatter.currency(smallTotal)
			}),
			icon: bulbOutline,
			id: 'small-expenses',
			title: $t('routes.organization.budget-statistics.page.insights.small-expenses.title'),
			type: 'info'
		};
	}

	const insights = $derived.by<Insight[]>(() => {
		const detectors = [
			detectAnomalyInsight,
			detectSpendingTrendInsight,
			detectTopCategoryInsight,
			detectSavingsInsight,
			detectInactivityInsight,
			detectSmallExpensesInsight
		];

		return detectors.map((detect) => detect()).filter((insight): insight is Insight => insight !== undefined);
	});

	function getInsightBorderColorClass(type: InsightType): string {
		switch (type) {
			case 'success': {
				return 'border-[var(--ion-color-success-shade)]';
			}
			case 'warning': {
				return 'border-[var(--ion-color-warning-shade)]';
			}
			case 'danger': {
				return 'border-[var(--ion-color-danger-shade)]';
			}
			default: {
				return 'border-[var(--ion-color-secondary-shade)]';
			}
		}
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

<Card title={$t('routes.organization.budget-statistics.page.insights.title')} titleIconStart={sparklesOutline} lazy>
	<div class="p-4">
		{#if insights.length > 0}
			<div class="flex flex-col gap-4">
				{#each insights as insight (insight.id)}
					<div class="rounded-lg border-2 p-3 {getInsightBorderColorClass(insight.type)}">
						<div class="flex items-start gap-3">
							<ion-icon icon={insight.icon} color={getColorFromType(insight.type)} class="mt-0.5 text-xl"></ion-icon>
							<div class="min-w-0 flex-1">
								<div class="flex w-full min-w-0 items-start gap-3 overflow-hidden">
									<div class="min-w-0 grow basis-0 break-normal whitespace-normal">
										{insight.title}
									</div>
									<ion-badge
										class="max-w-3/5 min-w-0 shrink basis-auto truncate whitespace-nowrap"
										color={getColorFromType(insight.type)}>{insight.value}</ion-badge
									>
								</div>

								<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
									{insight.description}
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-8 text-center text-gray-500">
				<ion-icon icon={sparklesOutline} class="mb-2 text-4xl text-gray-400"></ion-icon>
				<div>{$t('routes.organization.budget-statistics.page.insights.no-insights')}</div>
				<div class="mt-1 text-xs">
					{$t('routes.organization.budget-statistics.page.insights.hint')}
				</div>
			</div>
		{/if}
	</div>
</Card>
