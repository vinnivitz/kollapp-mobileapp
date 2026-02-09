<script lang="ts">
	import type { FilterConfig } from '$lib/models/ui';
	import type { OrganizationBudgetCategoryResponseTO, PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { cardOutline, downloadOutline, listOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { Button, Card, CustomItem, Modal } from '$lib/components/core';
	import { FilterPanel } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { chipSection } from '$lib/models/ui';
	import { formatter } from '$lib/utility';

	let mounted = $state(false);
	onMount(() => (mounted = true));

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

	const CATEGORY_COUNT_TRESHOLD = 4;

	let modalOpen = $state(false);
	let searchValue = $state('');
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

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 300,
			stacked: false,
			toolbar: { show: false },
			type: 'bar'
		},
		colors: ['var(--ion-color-success)', 'var(--ion-color-danger)'],
		dataLabels: { enabled: false },
		grid: {
			padding: { bottom: 20 }
		},
		labels: categoryActuals.slice(0, 6).map((s) => s.category.name),
		legend: {
			labels: { colors: 'var(--ion-color-dark)' },
			position: 'top',
			show: true
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				horizontal: false
			}
		},
		series: [
			{
				data: categoryActuals.slice(0, 6).map((s) => s.credit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit')
			},
			{
				data: categoryActuals.slice(0, 6).map((s) => s.debit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.debit')
			}
		],
		tooltip: {
			theme: isDarkMode ? 'dark' : 'light'
		},
		xaxis: {
			labels: {
				rotate: -45,
				rotateAlways: true,
				style: {
					colors: 'var(--ion-color-dark)',
					fontSize: '11px'
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
	title={$t('routes.organization.budget-statistics.page.category-statistics.title')}
	titleIconStart={cardOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	{#if categoryActuals.length === 0}
		<ion-text color="medium">
			{$t('routes.organization.budget-statistics.page.category-statistics.no-data')}
		</ion-text>
	{:else}
		{#if mounted}
			<Chart options={chartOptions}></Chart>
		{/if}

		<div class="mt-2">
			{#each categoryActuals.slice(0, CATEGORY_COUNT_TRESHOLD) as actual (actual.category.id)}
				<CustomItem>
					<div class="flex w-full flex-row items-center justify-between gap-2">
						<div class="flex flex-1 flex-col">
							<ion-text>{actual.category.name}</ion-text>
							<div class="flex gap-3 text-xs">
								<ion-text color="success">+{formatter.currency(actual.credit)}</ion-text>
								<ion-text color="danger">-{formatter.currency(actual.debit)}</ion-text>
							</div>
						</div>
						<div class="flex flex-col items-end">
							<ion-text class="font-bold" color={actual.net >= 0 ? 'success' : 'danger'}>
								{formatter.currency(actual.net)}
							</ion-text>
							<ion-note class="text-xs">
								{actual.share.toFixed(1)}% {$t(
									'routes.organization.budget-statistics.page.category-statistics.of-total'
								)}
							</ion-note>
						</div>
					</div>
				</CustomItem>
			{/each}
		</div>
		{#if categoryActuals.length > CATEGORY_COUNT_TRESHOLD}
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
	title={$t('routes.organization.budget-statistics.page.category-statistics.title')}
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
					<CustomItem>
						<div class="flex w-full flex-row items-center justify-between gap-2">
							<div class="flex flex-1 flex-col">
								<ion-text>{actual.category.name}</ion-text>
								<div class="flex gap-3 text-xs">
									<ion-text color="success">+{formatter.currency(actual.credit)}</ion-text>
									<ion-text color="danger">-{formatter.currency(actual.debit)}</ion-text>
								</div>
							</div>
							<div class="flex flex-col items-end">
								<ion-text class="font-bold" color={actual.net >= 0 ? 'success' : 'danger'}>
									{formatter.currency(actual.net)}
								</ion-text>
								<ion-note class="text-xs">
									{actual.share.toFixed(1)}% {$t(
										'routes.organization.budget-statistics.page.category-statistics.of-total'
									)}
								</ion-note>
							</div>
						</div>
					</CustomItem>
				{/each}
			</ion-list>
		{/if}
	</div>
</Modal>
