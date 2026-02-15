<script lang="ts">
	import type { FilterConfig } from '$lib/models/ui';
	import type { OrganizationBudgetCategoryResponseTO, PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { downloadOutline, listOutline, pieChartOutline } from 'ionicons/icons';

	import DeferredChart from './DeferredChart.svelte';

	import { Button, Card, Modal } from '$lib/components/core';
	import { StatisticItem } from '$lib/components/internal/budget/statistics';
	import { FilterPanel } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { chipSection } from '$lib/models/ui';
	import { formatter } from '$lib/utility';

	type Properties = {
		budgetCategories: OrganizationBudgetCategoryResponseTO[];
		isDarkMode: boolean;
		postings: PostingTO[];
		onDownload?: () => void;
	};

	type CategoryActual = {
		category: OrganizationBudgetCategoryResponseTO;
		credit: number;
		debit: number;
		net: number;
		share: number;
	};

	type SortKey = 'credit' | 'debit' | 'name' | 'net' | 'share';
	type SortOrder = 'asc' | 'desc';
	type CategoryFilterState = {
		sortBy: SortKey;
		sortOrder: SortOrder;
	};

	let { budgetCategories, isDarkMode, onDownload, postings }: Properties = $props();

	const TOP_CATEGORIES_COUNT = 5;
	const DONUT_COLORS = [
		'var(--ion-color-primary)',
		'var(--ion-color-secondary)',
		'var(--ion-color-tertiary)',
		'var(--ion-color-success)',
		'var(--ion-color-warning)',
		'var(--ion-color-danger)'
	];

	let modalOpen = $state<boolean>(false);
	let searchValue = $state<string>('');
	let sortBy = $state<SortKey>('debit');
	let sortOrder = $state<SortOrder>('desc');
	let filterState = $state<CategoryFilterState>();

	const totalDebit = $derived(
		postings.filter((posting) => posting.type === 'DEBIT').reduce((sum, posting) => sum + posting.amountInCents, 0)
	);

	const categoryActuals = $derived.by<CategoryActual[]>(() => {
		const categories = budgetCategories ?? [];
		return categories
			.map((category) => {
				const categoryPostings = postings.filter((posting) => posting.organizationBudgetCategoryId === category.id);
				const credit = categoryPostings
					.filter((posting) => posting.type === 'CREDIT')
					.reduce((sum, posting) => sum + posting.amountInCents, 0);
				const debit = categoryPostings
					.filter((posting) => posting.type === 'DEBIT')
					.reduce((sum, posting) => sum + posting.amountInCents, 0);
				const net = credit - debit;
				const share = totalDebit > 0 ? (debit / totalDebit) * 100 : 0;

				return { category, credit, debit, net, share };
			})
			.filter((s) => s.credit > 0 || s.debit > 0)
			.toSorted((a, b) => b.debit - a.debit);
	});

	const filteredAndSortedActuals = $derived.by<CategoryActual[]>(() => {
		const search = searchValue.trim().toLowerCase();
		const filtered =
			search === '' ? categoryActuals : categoryActuals.filter((a) => a.category.name.toLowerCase().includes(search));

		return [...filtered].toSorted((a, b) => {
			let cmp = 0;
			switch (sortBy) {
				case 'name': {
					cmp = a.category.name.localeCompare(b.category.name);
					break;
				}
				case 'credit': {
					cmp = a.credit - b.credit;
					break;
				}
				case 'debit': {
					cmp = a.debit - b.debit;
					break;
				}
				case 'net': {
					cmp = a.net - b.net;
					break;
				}
				case 'share': {
					cmp = a.share - b.share;
					break;
				}
			}
			return sortOrder === 'desc' ? -cmp : cmp;
		});
	});

	const modalFilterConfig = $derived<FilterConfig<CategoryFilterState>>({
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
				defaultValue: 'debit',
				label: $t('components.posting-overview.filter.sort.label'),
				options: [
					{ label: $t('components.posting-overview.filter.sort.category'), value: 'name' },
					{ label: $t('routes.organization.budget-statistics.page.chart.credit'), value: 'credit' },
					{ label: $t('routes.organization.budget-statistics.page.chart.debit'), value: 'debit' },
					{ label: $t('routes.organization.budget-statistics.page.member-statistics.net'), value: 'net' },
					{ label: $t('routes.organization.budget-statistics.page.category-statistics.of-total'), value: 'share' }
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

	const chartCategories = $derived(categoryActuals.slice(0, TOP_CATEGORIES_COUNT));

	const donutOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 260,
			toolbar: { show: false },
			type: 'donut'
		},
		colors: DONUT_COLORS.slice(0, chartCategories.length),
		dataLabels: {
			enabled: true,
			formatter: (value: number) => `${value.toFixed(0)}%`,
			style: {
				fontSize: '11px',
				fontWeight: 600
			}
		},
		labels: chartCategories.map((s) => s.category.name),
		legend: {
			labels: { colors: 'var(--ion-color-dark)' },
			position: 'bottom',
			show: true
		},
		plotOptions: {
			pie: {
				donut: {
					labels: {
						name: {
							color: 'var(--ion-color-medium)',
							fontSize: '11px',
							show: true
						},
						show: true,
						total: {
							color: 'var(--ion-color-dark)',
							fontSize: '13px',
							formatter: () => formatter.currency(totalDebit, true),
							label: $t('routes.organization.budget-statistics.page.chart.debit'),
							show: true
						},
						value: {
							color: 'var(--ion-color-dark)',
							fontSize: '14px',
							formatter: (value: string) => formatter.currency(Number(value) * 100),
							show: true
						}
					},
					size: '65%'
				},
				expandOnClick: true
			}
		},
		series: chartCategories.map((s) => s.debit / 100),
		tooltip: {
			theme: isDarkMode ? 'dark' : 'light',
			y: {
				formatter: (value: number) => formatter.currency(value * 100)
			}
		}
	});
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.category-statistics.title')}
	titleIconStart={pieChartOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	{#if categoryActuals.length === 0}
		<ion-text color="medium">
			{$t('routes.organization.budget-statistics.page.category-statistics.no-data')}
		</ion-text>
	{:else}
		<DeferredChart options={donutOptions} />

		{#each categoryActuals.slice(0, TOP_CATEGORIES_COUNT) as actual (actual.category.id)}
			<StatisticItem
				label={actual.category.name}
				credit={actual.credit}
				debit={actual.debit}
				total={actual.net}
				note="{actual.share.toFixed(1)}% {$t(
					'routes.organization.budget-statistics.page.category-statistics.of-total'
				)}"
			/>
		{/each}
		{#if categoryActuals.length > TOP_CATEGORIES_COUNT}
			<div class="mt-2 flex justify-center">
				<Button
					fill="clear"
					size="small"
					label={$t('routes.organization.budget-statistics.page.category-statistics.show-all')}
					icon={listOutline}
					clicked={() => (modalOpen = true)}
				/>
			</div>
		{/if}
	{/if}
</Card>

<Modal
	open={modalOpen}
	dismissed={() => {
		modalOpen = false;
		searchValue = '';
		filterState = undefined;
		sortBy = 'debit';
		sortOrder = 'desc';
	}}
	informational
	lazy
>
	<div class="relative">
		<div class="sticky top-0 left-0 z-10 pb-3">
			<FilterPanel classList="flex-1" config={modalFilterConfig} />
		</div>
		{#if filteredAndSortedActuals.length === 0}
			<div class="mt-3 flex flex-col items-center justify-center gap-2 text-center">
				<ion-note>{$t('routes.organization.budget-statistics.page.category-statistics.no-data')}</ion-note>
			</div>
		{:else}
			<ion-list>
				{#each filteredAndSortedActuals as actual (actual.category.id)}
					<StatisticItem
						label={actual.category.name}
						credit={actual.credit}
						debit={actual.debit}
						total={actual.net}
						note="{actual.share.toFixed(1)}% {$t(
							'routes.organization.budget-statistics.page.category-statistics.of-total'
						)}"
					/>
				{/each}
			</ion-list>
		{/if}
	</div>
</Modal>
