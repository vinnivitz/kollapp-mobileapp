<script lang="ts">
	import type {
		ActivityTO,
		OrganizationBudgetCategoryResponseTO,
		PersonOfOrganizationTO,
		PostingTO
	} from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { format, startOfMonth } from 'date-fns';
	import {
		analyticsOutline,
		barChartOutline,
		calendarOutline,
		cardOutline,
		peopleOutline,
		personOutline,
		statsChartOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import { budgetService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import FadeInOut from '$lib/components/utility/FadeInOut.svelte';
	import PostingItem from '$lib/components/widgets/budget/PostingItem.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import { t } from '$lib/locales';
	import { Theme } from '$lib/models/ui';
	import { organizationStore, themeStore } from '$lib/stores';
	import { formatter } from '$lib/utility';

	type TimeRange = '12months' | '3months' | '6months' | 'all';
	type CategoryStats = { category: OrganizationBudgetCategoryResponseTO; credit: number; debit: number };
	type PersonOfOrganizationStats = { credit: number; debit: number; personOfOrganization: PersonOfOrganizationTO };
	type MonthlyData = { credit: number; debit: number; month: string };

	let mounted = $state<boolean>(false);
	let selectedTimeRange = $state<TimeRange>('all');
	let isEditingPosting = $state<boolean>(false);
	let stablePostings = $state<PostingTO[]>([]);

	const isDarkMode = $derived($themeStore === Theme.DARK);

	const activityByPostingId = $derived<SvelteMap<number, ActivityTO | undefined>>(
		new SvelteMap(
			($organizationStore?.activities ?? []).flatMap((activity) =>
				activity.activityPostings.map((posting) => [posting.id, activity] as [number, ActivityTO])
			)
		)
	);

	const postings = $derived<PostingTO[]>([
		...($organizationStore?.organizationPostings ?? []),
		...($organizationStore?.activities.flatMap((activity) => activity.activityPostings) ?? [])
	]);

	const filteredPostings = $derived.by<PostingTO[]>(() => {
		if (selectedTimeRange === 'all') return stablePostings;

		const now = new TZDate();
		let months: number;
		if (selectedTimeRange === '3months') {
			months = 3;
		} else if (selectedTimeRange === '6months') {
			months = 6;
		} else {
			months = 12;
		}
		const cutoffDate = new TZDate(now.getFullYear(), now.getMonth() - months, now.getDate());

		return stablePostings.filter((p) => new TZDate(p.date) >= cutoffDate);
	});

	const totalCredit = $derived(
		filteredPostings
			.filter((posting) => posting.type === 'CREDIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);
	const totalDebit = $derived(
		filteredPostings
			.filter((posting) => posting.type === 'DEBIT')
			.reduce((sum, posting) => sum + posting.amountInCents, 0)
	);
	const balance = $derived(totalCredit - totalDebit);
	const transactionCount = $derived(filteredPostings.length);
	const avgTransaction = $derived(transactionCount > 0 ? (totalCredit + totalDebit) / transactionCount : 0);

	const categoryStatistics = $derived.by<CategoryStats[]>(() => {
		const categories = $organizationStore?.budgetCategories ?? [];
		return categories
			.map((category) => {
				const categoryPostings = filteredPostings.filter(
					(posting) => posting.organizationBudgetCategoryId === category.id
				);
				return {
					category,
					credit: categoryPostings
						.filter((posting) => posting.type === 'CREDIT')
						.reduce((sum, posting) => sum + posting.amountInCents, 0),
					debit: categoryPostings
						.filter((posting) => posting.type === 'DEBIT')
						.reduce((sum, posting) => sum + posting.amountInCents, 0)
				};
			})
			.filter((s) => s.credit > 0 || s.debit > 0)
			.toSorted((a, b) => b.debit + b.credit - (a.debit + a.credit));
	});

	const memberStatistics = $derived.by<PersonOfOrganizationStats[]>(() => {
		const personsOfOrganization = $organizationStore?.personsOfOrganization ?? [];
		return personsOfOrganization
			.map((personOfOrganization) => {
				const personOfOrganizationPostings = filteredPostings.filter(
					(posting) => posting.personOfOrganizationId === personOfOrganization.id
				);
				return {
					credit: personOfOrganizationPostings
						.filter((posting) => posting.type === 'CREDIT')
						.reduce((sum, posting) => sum + posting.amountInCents, 0),
					debit: personOfOrganizationPostings
						.filter((posting) => posting.type === 'DEBIT')
						.reduce((sum, posting) => sum + posting.amountInCents, 0),
					personOfOrganization
				};
			})
			.filter((stats) => stats.credit > 0 || stats.debit > 0)
			.toSorted((a, b) => b.debit + b.credit - (a.debit + a.credit));
	});

	const monthlyData = $derived.by<MonthlyData[]>(() => {
		const monthMap = new SvelteMap<string, MonthlyData>();

		for (const posting of filteredPostings) {
			const date = new TZDate(posting.date);
			const monthKey = format(startOfMonth(date), 'yyyy-MM');
			const monthLabel = format(date, 'MMM yyyy');

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

	const topCredits = $derived(
		[...filteredPostings]
			.filter((posting) => posting.type === 'CREDIT')
			.toSorted((a, b) => b.amountInCents - a.amountInCents)
			.slice(0, 5)
	);

	const topDebits = $derived(
		[...filteredPostings]
			.filter((posting) => posting.type === 'DEBIT')
			.toSorted((a, b) => b.amountInCents - a.amountInCents)
			.slice(0, 5)
	);

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

	const categoryChartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 300,
			stacked: true,
			toolbar: { show: false },
			type: 'bar'
		},
		colors: ['var(--ion-color-success)', 'var(--ion-color-danger)'],
		dataLabels: { enabled: false },
		grid: {
			padding: {
				bottom: 20
			}
		},
		labels: categoryStatistics.slice(0, 6).map((s) => s.category.name),
		legend: {
			labels: {
				colors: 'var(--ion-color-dark)'
			},
			position: 'top',
			show: true
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				horizontal: true
			}
		},
		series: [
			{
				data: categoryStatistics.slice(0, 6).map((s) => s.credit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit')
			},
			{
				data: categoryStatistics.slice(0, 6).map((s) => s.debit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.debit')
			}
		],
		tooltip: {
			theme: isDarkMode ? 'dark' : 'light'
		},
		xaxis: {
			labels: {
				formatter: (value: string) => formatter.currency(Number(value) * 100, true),
				rotate: -45,
				rotateAlways: true,
				style: {
					colors: 'var(--ion-color-dark)'
				}
			}
		},
		yaxis: {
			labels: {
				style: {
					colors: 'var(--ion-color-dark)',
					fontSize: '11px'
				}
			}
		}
	});

	$effect(() => {
		if (!isEditingPosting) {
			stablePostings = [...postings];
		}
	});

	onMount(() => (mounted = true));
</script>

<Layout title={$t('routes.organization.budget-statistics.page.title')} showBackButton>
	{#if stablePostings.length === 0}
		{@render emptyState()}
	{:else}
		{@render timeRangeFilter()}
		{@render transactionCountNote()}
		{@render overviewCards()}
		{@render trendChart()}
		{@render categoryChart()}
		{@render memberStatsCard()}
		{@render topTransactionsCards()}
	{/if}
</Layout>

{#snippet emptyState()}
	<div class="flex flex-col items-center justify-center py-10">
		<ion-icon icon={analyticsOutline} class="text-6xl text-gray-400"></ion-icon>
		<ion-note class="mt-4">{$t('routes.organization.budget-statistics.page.no-postings')}</ion-note>
	</div>
{/snippet}

{#snippet timeRangeFilter()}
	<div class="mb-4 flex flex-wrap items-center justify-center">
		<Chip
			icon={calendarOutline}
			label={$t('routes.organization.budget-statistics.page.filter.all')}
			color="secondary"
			selected={selectedTimeRange === 'all'}
			clicked={() => (selectedTimeRange = 'all')}
		/>
		<Chip
			label={$t('routes.organization.budget-statistics.page.filter.3months')}
			color="secondary"
			selected={selectedTimeRange === '3months'}
			clicked={() => (selectedTimeRange = '3months')}
		/>
		<Chip
			label={$t('routes.organization.budget-statistics.page.filter.6months')}
			color="secondary"
			selected={selectedTimeRange === '6months'}
			clicked={() => (selectedTimeRange = '6months')}
		/>
		<Chip
			label={$t('routes.organization.budget-statistics.page.filter.12months')}
			color="secondary"
			selected={selectedTimeRange === '12months'}
			clicked={() => (selectedTimeRange = '12months')}
		/>
	</div>
{/snippet}

{#snippet transactionCountNote()}
	<div class="mt-4 text-center">
		<ion-note>
			{$t('routes.organization.budget-statistics.page.transaction-count', { value: transactionCount })}
		</ion-note>
	</div>
{/snippet}

{#snippet overviewCards()}
	<div class="grid grid-cols-2">
		<Card classList="text-center">
			<div class="flex flex-col items-center gap-1 py-2">
				<ion-icon icon={trendingUpOutline} color="success" class="text-2xl"></ion-icon>
				<ion-text class="text-xs" color="medium">
					{$t('routes.organization.budget-statistics.page.overview.credit')}
				</ion-text>
				<ion-text class="text-lg font-bold" color="success">{formatter.currency(totalCredit)}</ion-text>
			</div>
		</Card>
		<Card classList="text-center">
			<div class="flex flex-col items-center gap-1 py-2">
				<ion-icon icon={trendingDownOutline} color="danger" class="text-2xl"></ion-icon>
				<ion-text class="text-xs" color="medium">
					{$t('routes.organization.budget-statistics.page.overview.debit')}
				</ion-text>
				<ion-text class="text-lg font-bold" color="danger">{formatter.currency(totalDebit)}</ion-text>
			</div>
		</Card>
		<Card classList="text-center">
			<div class="flex flex-col items-center gap-1 py-2">
				<ion-icon icon={cardOutline} class="text-2xl"></ion-icon>
				<ion-text class="text-xs" color="medium">
					{$t('routes.organization.budget-statistics.page.overview.balance')}
				</ion-text>
				<ion-text class="text-lg font-bold" color={balance >= 0 ? 'success' : 'danger'}>
					{formatter.currency(balance)}
				</ion-text>
			</div>
		</Card>
		<Card classList="text-center">
			<div class="flex flex-col items-center gap-1 py-2">
				<ion-icon icon={statsChartOutline} class="text-2xl"></ion-icon>
				<ion-text class="text-xs" color="medium">
					{$t('routes.organization.budget-statistics.page.overview.avg')}
				</ion-text>
				<ion-text class="text-lg font-bold">{formatter.currency(avgTransaction)}</ion-text>
			</div>
		</Card>
	</div>
{/snippet}

{#snippet trendChart()}
	{#if monthlyData.length > 1}
		<FadeInOut>
			<Card
				title={$t('routes.organization.budget-statistics.page.trend.title')}
				titleIconStart={statsChartOutline}
				classList="mt-4"
				lazy
			>
				<div class="h-[250px]">
					{#if mounted}
						<Chart options={trendChartOptions}></Chart>
					{/if}
				</div>
			</Card>
		</FadeInOut>
	{/if}
{/snippet}

{#snippet categoryChart()}
	{#if categoryStatistics.length > 0}
		<FadeInOut>
			<Card
				lazy
				title={$t('routes.organization.budget-statistics.page.categories.title')}
				titleIconStart={barChartOutline}
				classList="mt-4"
			>
				<div class="h-[300px]">
					{#if mounted}
						<Chart options={categoryChartOptions}></Chart>
					{/if}
				</div>
			</Card>
		</FadeInOut>
	{/if}
{/snippet}

{#snippet memberStatsCard()}
	{#if memberStatistics.length > 0}
		<FadeInOut>
			<Card
				lazy
				titleIconStart={peopleOutline}
				title={$t('routes.organization.budget-statistics.page.members.title')}
				classList="mt-4"
			>
				{#each memberStatistics.slice(0, 5) as statistic (statistic.personOfOrganization.id)}
					<CustomItem icon={personOutline}>
						<div class="flex w-full flex-row items-center justify-between gap-2">
							<div class="flex flex-1 flex-col">
								<ion-text>{statistic.personOfOrganization.username}</ion-text>
								<div class="flex gap-4 text-sm">
									<ion-text color="success">+{formatter.currency(statistic.credit)}</ion-text>
									<ion-text color="danger">-{formatter.currency(statistic.debit)}</ion-text>
								</div>
							</div>
							<ion-text class="font-bold" color={statistic.credit - statistic.debit >= 0 ? 'success' : 'danger'}>
								{formatter.currency(statistic.credit - statistic.debit)}
							</ion-text>
						</div>
					</CustomItem>
				{/each}
			</Card>
		</FadeInOut>
	{/if}
{/snippet}

{#snippet topTransactionsCards()}
	<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
		{#if topCredits.length > 0}
			<FadeInOut>
				<Card
					lazy
					title={$t('routes.organization.budget-statistics.page.top-credits.title')}
					titleIconStart={trendingUpOutline}
				>
					{#each topCredits as posting (posting.id)}
						<PostingItem
							onEditStart={() => (isEditingPosting = true)}
							onEditEnd={() => (isEditingPosting = false)}
							personsOfOrganization={$organizationStore?.personsOfOrganization!}
							{posting}
							activity={activityByPostingId.get(posting.id)}
							activities={$organizationStore?.activities!}
							budgetCategories={$organizationStore?.budgetCategories!}
							onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
							onUpdateActivityPosting={budgetService.updateActivityPosting}
							onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
							onTransferActivityPosting={budgetService.transferActivityPosting}
							onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
							onDeleteActivityPosting={budgetService.deleteActivityPosting}
						/>
					{/each}
				</Card>
			</FadeInOut>
		{/if}

		{#if topDebits.length > 0}
			<Card
				lazy
				title={$t('routes.organization.budget-statistics.page.top-debits.title')}
				titleIconStart={trendingDownOutline}
			>
				{#each topDebits as posting (posting.id)}
					<PostingItem
						onEditStart={() => {}}
						onEditEnd={() => {}}
						personsOfOrganization={$organizationStore?.personsOfOrganization!}
						{posting}
						activity={activityByPostingId.get(posting.id)}
						activities={$organizationStore?.activities!}
						budgetCategories={$organizationStore?.budgetCategories!}
						onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
						onUpdateActivityPosting={budgetService.updateActivityPosting}
						onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
						onTransferActivityPosting={budgetService.transferActivityPosting}
						onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
						onDeleteActivityPosting={budgetService.deleteActivityPosting}
					/>
				{/each}
			</Card>
		{/if}
	</div>
{/snippet}
