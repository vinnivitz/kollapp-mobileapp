<script lang="ts">
	import type { FilterConfig } from '$lib/models/ui';
	import type { ActivityTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { downloadOutline, listOutline, podiumOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { Button, Card, Modal } from '$lib/components/core';
	import { StatisticItem } from '$lib/components/internal/budget/statistics';
	import { FilterPanel } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { chipSection } from '$lib/models/ui';
	import { formatter } from '$lib/utility';

	type Properties = {
		activities: ActivityTO[];
		isDarkMode: boolean;
		onDownload?: () => void;
	};

	type ActivityStats = {
		activity: ActivityTO;
		costPerPosting: number;
		netCost: number;
		postingCount: number;
		totalCredit: number;
		totalDebit: number;
	};

	type SortKey = 'cost-per-posting' | 'credit' | 'debit' | 'name' | 'net' | 'postings';
	type SortOrder = 'asc' | 'desc';
	type ActivityFilterState = {
		sortBy: SortKey;
		sortOrder: SortOrder;
	};

	let { activities, isDarkMode, onDownload }: Properties = $props();

	const TOP_ACTIVITIES_COUNT = 4;

	let modalOpen = $state<boolean>(false);
	let searchValue = $state<string>('');
	let sortBy = $state<SortKey>('net');
	let sortOrder = $state<SortOrder>('desc');
	let filterState = $state<ActivityFilterState>();

	const activityStats = $derived.by<ActivityStats[]>(() => {
		return activities
			.map((activity) => {
				const postings = activity.activityPostings ?? [];
				const totalCredit = postings
					.filter((p) => p.type === 'CREDIT')
					.reduce((sum, posting) => sum + posting.amountInCents, 0);
				const totalDebit = postings
					.filter((p) => p.type === 'DEBIT')
					.reduce((sum, posting) => sum + posting.amountInCents, 0);

				return {
					activity,
					costPerPosting: postings.length > 0 ? totalDebit / postings.length : 0,
					netCost: totalDebit - totalCredit,
					postingCount: postings.length,
					totalCredit,
					totalDebit
				};
			})
			.filter((stat) => stat.postingCount > 0)
			.toSorted((statA, statB) => statB.netCost - statA.netCost);
	});

	const totalActivityCost = $derived(activityStats.reduce((sum, stat) => sum + stat.netCost, 0));
	const avgActivityCost = $derived(activityStats.length > 0 ? totalActivityCost / activityStats.length : 0);

	const filteredAndSortedStats = $derived.by<ActivityStats[]>(() => {
		const search = searchValue.trim().toLowerCase();
		const filtered =
			search === '' ? activityStats : activityStats.filter((s) => s.activity.name.toLowerCase().includes(search));

		return [...filtered].toSorted((a, b) => {
			let cmp = 0;
			switch (sortBy) {
				case 'name': {
					cmp = a.activity.name.localeCompare(b.activity.name);
					break;
				}
				case 'credit': {
					cmp = a.totalCredit - b.totalCredit;
					break;
				}
				case 'debit': {
					cmp = a.totalDebit - b.totalDebit;
					break;
				}
				case 'net': {
					cmp = a.netCost - b.netCost;
					break;
				}
				case 'postings': {
					cmp = a.postingCount - b.postingCount;
					break;
				}
				case 'cost-per-posting': {
					cmp = a.costPerPosting - b.costPerPosting;
					break;
				}
			}
			return sortOrder === 'desc' ? -cmp : cmp;
		});
	});

	const modalFilterConfig = $derived<FilterConfig<ActivityFilterState>>({
		onApply: (state) => {
			filterState = state;
			sortBy = state.sortBy;
			sortOrder = state.sortOrder;
		},
		searchbar: {
			onSearch: (value) => (searchValue = value),
			placeholder: $t('components.posting-overview.search.placeholder'),
			value: searchValue
		},
		sections: [
			chipSection<SortKey>('sortBy', {
				defaultValue: 'net',
				label: $t('components.posting-overview.filter.sort.label'),
				options: [
					{ label: $t('components.posting-overview.filter.sort.activity'), value: 'name' },
					{ label: $t('routes.organization.budget-statistics.page.chart.credit'), value: 'credit' },
					{ label: $t('routes.organization.budget-statistics.page.chart.debit'), value: 'debit' },
					{ label: $t('routes.organization.budget-statistics.page.member-statistics.net'), value: 'net' },
					{ label: $t('routes.organization.budget-statistics.page.activities.transactions'), value: 'postings' },
					{ label: $t('routes.organization.budget-statistics.page.activities.avg-cost'), value: 'cost-per-posting' }
				]
			}),
			chipSection<SortOrder>('sortOrder', {
				defaultValue: 'desc',
				label: $t('components.posting-overview.filter.order.label'),
				options: [
					{ label: $t('components.posting-overview.filter.order.ascending'), value: 'asc' },
					{ label: $t('components.posting-overview.filter.order.descending'), value: 'desc' }
				]
			})
		],
		state: filterState,
		title: $t('components.posting-overview.filter.title')
	});

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 260,
			stacked: false,
			toolbar: { show: false },
			type: 'bar'
		},
		colors: ['var(--ion-color-success)', 'var(--ion-color-danger)'],
		dataLabels: { enabled: false },
		grid: {
			padding: { bottom: 0, left: 10 }
		},
		labels: activityStats.slice(0, TOP_ACTIVITIES_COUNT).map((s) => s.activity.name),
		legend: {
			labels: { colors: 'var(--ion-color-dark)' },
			position: 'top',
			show: true
		},
		plotOptions: {
			bar: {
				borderRadius: 3,
				columnWidth: '55%',
				horizontal: false
			}
		},
		series: [
			{
				data: activityStats.slice(0, TOP_ACTIVITIES_COUNT).map((s) => s.totalCredit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit')
			},
			{
				data: activityStats.slice(0, TOP_ACTIVITIES_COUNT).map((s) => s.totalDebit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.debit')
			}
		],
		tooltip: {
			theme: isDarkMode ? 'dark' : 'light',
			y: {
				formatter: (value: number) => formatter.currency(value * 100)
			}
		},
		xaxis: {
			labels: {
				rotate: -45,
				rotateAlways: true,
				style: { colors: 'var(--ion-color-dark)', fontSize: '11px' },
				trim: true
			}
		},
		yaxis: {
			labels: {
				formatter: (value: number) => formatter.currency(value * 100, true),
				style: {
					colors: 'var(--ion-color-dark)',
					fontSize: '11px'
				}
			}
		}
	});
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.activities.title')}
	titleIconStart={podiumOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	{#if activityStats.length > 0}
		<div class="mb-3 flex items-center justify-around gap-2">
			<div class="flex flex-1 flex-col items-center gap-1 rounded-lg p-2" style="background: var(--ion-color-light);">
				<ion-text class="text-2xl font-bold">{activityStats.length}</ion-text>
				<ion-note class="text-xs">
					{$t('routes.organization.budget-statistics.page.activities.total-activities')}
				</ion-note>
			</div>
			<div class="flex flex-1 flex-col items-center gap-1 rounded-lg p-2" style="background: var(--ion-color-light);">
				<ion-text class="text-2xl font-bold">{formatter.currency(avgActivityCost, true)}</ion-text>
				<ion-note class="text-xs">
					{$t('routes.organization.budget-statistics.page.activities.avg-cost')}
				</ion-note>
			</div>
		</div>

		{#if activityStats.length > 1}
			<Chart options={chartOptions}></Chart>
		{/if}

		{#each activityStats.slice(0, TOP_ACTIVITIES_COUNT) as stats (stats.activity.id)}
			<StatisticItem
				label={stats.activity.name}
				credit={stats.totalCredit}
				debit={stats.totalDebit}
				total={stats.totalCredit - stats.totalDebit}
				note="{stats.postingCount} {$t('routes.organization.budget-statistics.page.activities.transactions')}"
				onAction={() => goto(resolve('/organization/activities/[slug]', { slug: stats.activity.id.toString() }))}
			/>
		{/each}
		{#if activityStats.length > TOP_ACTIVITIES_COUNT}
			<div class="mt-2 flex justify-center">
				<Button
					fill="clear"
					size="small"
					label={$t('routes.organization.budget-statistics.page.activities.show-all')}
					icon={listOutline}
					clicked={() => (modalOpen = true)}
				/>
			</div>
		{/if}
	{:else}
		<div class="py-8 text-center text-gray-500">
			{$t('routes.organization.budget-statistics.page.activities.no-activities')}
		</div>
	{/if}
</Card>

<Modal
	open={modalOpen}
	dismissed={() => {
		modalOpen = false;
		searchValue = '';
		filterState = undefined;
		sortBy = 'net';
		sortOrder = 'desc';
	}}
	informational
	lazy
>
	<div class="relative">
		<div class="sticky top-0 left-0 z-10 pb-3">
			<FilterPanel classList="flex-1" config={modalFilterConfig} />
		</div>
		{#if filteredAndSortedStats.length === 0}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-note>{$t('routes.organization.budget-statistics.page.activities.no-activities')}</ion-note>
			</div>
		{:else}
			<ion-list>
				{#each filteredAndSortedStats as stats (stats.activity.id)}
					<StatisticItem
						label={stats.activity.name}
						credit={stats.totalCredit}
						debit={stats.totalDebit}
						total={stats.totalCredit - stats.totalDebit}
						note="{stats.postingCount} {$t('routes.organization.budget-statistics.page.activities.transactions')}"
						onAction={() => goto(resolve('/organization/activities/[slug]', { slug: stats.activity.id.toString() }))}
					/>
				{/each}
			</ion-list>
		{/if}
	</div>
</Modal>
