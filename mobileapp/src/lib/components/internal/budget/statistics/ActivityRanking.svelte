<script lang="ts">
	import type { ActivityTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { downloadOutline, openOutline, podiumOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { Card, CustomItem } from '$lib/components/core';
	import { t } from '$lib/locales';
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

	let { activities, isDarkMode, onDownload }: Properties = $props();

	let mounted = $state(false);
	onMount(() => (mounted = true));

	const ACTIVITY_COUNT_TRESHOLD = 4;

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
		labels: activityStats.slice(0, ACTIVITY_COUNT_TRESHOLD).map((s) => s.activity.name),
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
				data: activityStats.slice(0, ACTIVITY_COUNT_TRESHOLD).map((s) => s.totalCredit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit')
			},
			{
				data: activityStats.slice(0, ACTIVITY_COUNT_TRESHOLD).map((s) => s.totalDebit / 100),
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

	async function onOpenAcitivity(activityId: number): Promise<void> {
		const activity = activities.find((activity) => activity.id === activityId);
		if (!activity) return;

		await goto(resolve('/organization/activities/[slug]', { slug: activityId.toString() }));
	}
</script>

<Card
	title={$t('routes.organization.budget-statistics.page.activities.title')}
	titleIconStart={podiumOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	<div class="flex flex-col gap-4">
		{#if activityStats.length > 0}
			<div class="flex items-center justify-around gap-2">
				<Card border="primary" classList="m-0 text-center flex-1" contentClass="p-3!">
					<div class="text-2xl font-bold">{activityStats.length}</div>
					<ion-note class="text-xs">
						{$t('routes.organization.budget-statistics.page.activities.total-activities')}
					</ion-note>
				</Card>
				<Card border="primary" classList="m-0 text-center flex-1" contentClass="p-3!">
					<div class="text-2xl font-bold">{formatter.currency(avgActivityCost, true)}</div>
					<ion-note class="text-xs">
						{$t('routes.organization.budget-statistics.page.activities.avg-cost')}
					</ion-note>
				</Card>
			</div>
			{#if activityStats.length > 1 && mounted}
				<Chart options={chartOptions}></Chart>
			{/if}

			{#each activityStats.slice(0, ACTIVITY_COUNT_TRESHOLD) as stats, index (stats.activity.id)}
				<CustomItem iconEnd={openOutline} iconClicked={() => onOpenAcitivity(stats.activity.id)}>
					<div class="flex w-full items-center gap-1">
						<span class="text-lg font-semibold" style="color: hsl({(index * 37) % 360}, 60%, 50%)">
							#{index + 1}
						</span>
						<div class="min-w-0 flex-1">
							<ion-text class="block truncate font-medium">{stats.activity.name}</ion-text>
							<div class="mt-1 flex flex-row items-start justify-between gap-2 text-xs">
								<div class="flex flex-col">
									<ion-text class="-ms-2" color="success">+{formatter.currency(stats.totalCredit)}</ion-text>
									<ion-text color="danger">-{formatter.currency(stats.totalDebit)}</ion-text>
								</div>
								<div class="-mt-2 flex flex-col items-end">
									<ion-text class="text-lg font-bold" color={stats.netCost > 0 ? 'danger' : 'success'}>
										{stats.netCost > 0 ? '-' : '+'}{formatter.currency(Math.abs(stats.netCost))}
									</ion-text>
									<ion-note class="-mt-1a text-xs">
										{stats.postingCount}
										{$t('routes.organization.budget-statistics.page.activities.bookings')}
									</ion-note>
								</div>
							</div>
						</div>
					</div>
				</CustomItem>
			{/each}
		{:else}
			<div class="py-8 text-center text-gray-500">
				{$t('routes.organization.budget-statistics.page.activities.no-activities')}
			</div>
		{/if}
	</div>
</Card>
