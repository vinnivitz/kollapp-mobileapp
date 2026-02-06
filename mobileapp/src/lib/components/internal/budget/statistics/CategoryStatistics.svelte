<script lang="ts">
	import type { OrganizationBudgetCategoryResponseTO, PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { barChartOutline } from 'ionicons/icons';

	import { Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		budgetCategories: OrganizationBudgetCategoryResponseTO[];
		isDarkMode: boolean;
		postings: PostingTO[];
	};
	type CategoryStats = { category: OrganizationBudgetCategoryResponseTO; credit: number; debit: number };

	let { budgetCategories, isDarkMode, postings }: Properties = $props();

	const statistics = $derived.by<CategoryStats[]>(() => {
		const categories = budgetCategories ?? [];
		return categories
			.map((category) => {
				const categoryPostings = postings.filter((posting) => posting.organizationBudgetCategoryId === category.id);
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

	const options = $derived<ApexOptions>({
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
		labels: statistics.slice(0, 6).map((s) => s.category.name),
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
				data: statistics.slice(0, 6).map((s) => s.credit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit')
			},
			{
				data: statistics.slice(0, 6).map((s) => s.debit / 100),
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
</script>

<Card lazy title={$t('routes.organization.budget-statistics.page.categories.title')} titleIconStart={barChartOutline}>
	{#if statistics.length === 0}
		<ion-text color="medium">{$t('components.internal.budget.statistics.no-data')}</ion-text>
	{:else}
		<Chart {options}></Chart>
	{/if}
</Card>
