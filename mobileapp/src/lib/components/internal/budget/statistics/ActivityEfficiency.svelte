<script lang="ts">
	import type { ActivityTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import { downloadOutline, gitNetworkOutline } from 'ionicons/icons';

	import DeferredChart from './DeferredChart.svelte';

	import { Card } from '$lib/components/core';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		activities: ActivityTO[];
		onDownload?: () => void;
	};

	type EventDataPoint = {
		activityName: string;
		netCost: number;
		postingCount: number;
	};

	let { activities, onDownload }: Properties = $props();

	const eventData = $derived.by<EventDataPoint[]>(() => {
		return activities
			.map((activity) => {
				const postings = activity.activityPostings ?? [];
				const totalCredit = postings.filter((p) => p.type === 'CREDIT').reduce((sum, p) => sum + p.amountInCents, 0);
				const totalDebit = postings.filter((p) => p.type === 'DEBIT').reduce((sum, p) => sum + p.amountInCents, 0);

				return {
					activityName: activity.name,
					netCost: (totalDebit - totalCredit) / 100,
					postingCount: postings.length
				};
			})
			.filter((d) => d.postingCount > 0);
	});

	const chartOptions = $derived<ApexOptions>({
		chart: {
			animations: { enabled: true },
			height: 280,
			toolbar: { show: false },
			type: 'scatter',
			zoom: { enabled: false }
		},
		colors: ['var(--ion-color-tertiary)'],
		dataLabels: { enabled: false },
		legend: { show: false },
		markers: {
			hover: { sizeOffset: 3 },
			size: 10
		},
		series: [
			{
				data: eventData.map((d) => [d.postingCount, d.netCost]),
				name: $t('routes.organization.budget-statistics.page.event-efficiency.series')
			}
		],
		states: {
			active: { filter: { type: 'none' } },
			hover: { filter: { type: 'lighten' } }
		},
		tooltip: {
			custom: ({ dataPointIndex }) => {
				const data = eventData[dataPointIndex];
				if (!data) return '';
				return `
					<div style="padding: 8px 12px; background: var(--ion-background-color); border: 1px solid var(--ion-color-light); border-radius: 8px;">
						<div style="font-weight: 600; color: var(--ion-text-color); margin-bottom: 4px;">${data.activityName}</div>
						<div style="font-size: 12px; color: var(--ion-color-medium);">
							${$t('routes.organization.budget-statistics.page.activities.transactions')}: ${data.postingCount}<br/>
							${$t('routes.organization.budget-statistics.page.event-efficiency.net-cost')}: ${formatter.currency(data.netCost * 100)}
						</div>
					</div>
				`;
			},
			intersect: true,
			shared: false
		},
		xaxis: {
			labels: {
				style: { colors: 'var(--ion-color-dark)' }
			},
			tickAmount: 5,
			title: {
				style: { color: 'var(--ion-color-medium)', fontSize: '11px' },
				text: $t('routes.organization.budget-statistics.page.activities.transactions')
			}
		},
		yaxis: {
			labels: {
				formatter: (value: number) => formatter.currency(value * 100, true),
				style: { colors: 'var(--ion-color-dark)' }
			},
			title: {
				style: { color: 'var(--ion-color-medium)', fontSize: '11px' },
				text: $t('routes.organization.budget-statistics.page.event-efficiency.net-cost')
			}
		}
	});
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.event-efficiency.title')}
	titleIconStart={gitNetworkOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
	lazyHeight="380px"
>
	{#if eventData.length >= 2}
		<ion-note class="block px-2 pb-2 text-center text-xs">
			{$t('routes.organization.budget-statistics.page.event-efficiency.hint')}
		</ion-note>
		<DeferredChart options={chartOptions} />
	{:else}
		<div class="py-6 text-center">
			<ion-note>{$t('routes.organization.budget-statistics.page.event-efficiency.no-data')}</ion-note>
		</div>
	{/if}
</Card>
