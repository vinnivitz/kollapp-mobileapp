<script lang="ts">
	import type { ActivityTO } from '@kollapp/api-types';

	import { podiumOutline } from 'ionicons/icons';

	import { Card } from '$lib/components/widgets/ionic';
	import { t } from '$lib/locales';
	import { formatter } from '$lib/utility';

	type Properties = {
		activities: ActivityTO[];
	};

	type ActivityStats = {
		activity: ActivityTO;
		costPerPosting: number;
		netCost: number;
		postingCount: number;
		totalCredit: number;
		totalDebit: number;
	};

	let { activities }: Properties = $props();

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
</script>

<Card title={$t('routes.organization.budget-statistics.page.activities.title')} titleIconStart={podiumOutline} lazy>
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

			<div class="flex flex-col gap-2">
				{#each activityStats.slice(0, 10) as stats, index (stats.activity.id)}
					<Card border="medium" classList="m-0" contentClass="p-3!">
						<div class="borderp-3 flex items-center gap-3 rounded-lg transition-colors">
							<div
								class="flex h-8 w-8 items-center justify-center text-lg"
								style="color: hsl({(index * 37) % 360}, 60%, 50%)"
							>
								#{index + 1}
							</div>

							<div class="flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium">{stats.activity.name}</span>
								</div>
								<ion-note class="text-x">
									{stats.postingCount}
									{$t('routes.organization.budget-statistics.page.activities.bookings')}
								</ion-note>
							</div>

							<div class="flex-1 text-right">
								<ion-text class="font-bold" color={stats.netCost > 0 ? 'danger' : 'success'}>
									{stats.netCost > 0 ? '-' : '+'}{formatter.currency(Math.abs(stats.netCost))}
								</ion-text>
								<div color="medium" class="text-xs">
									<ion-text color="success">+{formatter.currency(stats.totalCredit, true)}</ion-text>
									/
									<ion-text color="danger">-{formatter.currency(stats.totalDebit, true)}</ion-text>
								</div>
							</div>
						</div>
					</Card>
				{/each}
			</div>

			{#if activityStats.length > 1}
				<div>
					<div class="mb-2 text-sm font-medium">
						{$t('routes.organization.budget-statistics.page.activities.cost-distribution')}
					</div>
					<div class="flex h-4 overflow-hidden rounded-full">
						{#each activityStats as stats, index (stats.activity.id)}
							{@const percentage = totalActivityCost > 0 ? (stats.netCost / totalActivityCost) * 100 : 0}
							{#if percentage > 0}
								<div
									class="h-full"
									style="width: {percentage}%; background-color: hsl({(index * 37) % 360}, 60%, 50%)"
									title="{stats.activity.name}: {formatter.currency(stats.netCost)}"
								></div>
							{/if}
						{/each}
					</div>
					<div class="mt-2 flex flex-wrap gap-2">
						{#each activityStats.slice(0, 5) as stats, index (stats.activity.id)}
							<div class="flex items-center gap-1 text-xs">
								<div class="h-2 w-2 rounded-full" style="background-color: hsl({(index * 37) % 360}, 60%, 50%)"></div>
								<span>{stats.activity.name}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<div class="py-8 text-center text-gray-500">
				{$t('routes.organization.budget-statistics.page.activities.no-activities')}
			</div>
		{/if}
	</div>
</Card>
