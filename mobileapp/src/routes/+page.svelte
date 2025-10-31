<script lang="ts">
	import type { ApexOptions } from 'apexcharts';

	import { TZDate } from '@date-fns/tz';
	import Chart from '@edde746/svelte-apexcharts';
	import { addDays, formatDistanceToNow } from 'date-fns';
	import {
		accessibilityOutline,
		calendarOutline,
		cashOutline,
		flashOutline,
		notificationsOffOutline,
		peopleOutline,
		trendingDown,
		trendingUp
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import { t } from '$lib/locales';
	import { AccountPostingType, type ActivityModel, type OrganizationModel, type UserModel } from '$lib/models/models';
	import { PageRoute, type PageRoutePaths } from '$lib/models/routing';
	import { accountPostingsStore, localeStore, organizationStore, userStore } from '$lib/stores';
	import { featureNotImplementedAlert, formatter, getDateFnsLocale } from '$lib/utility';

	enum ChartType {
		ALL,
		CREDIT,
		DEBIT
	}

	const activity = $derived($organizationStore?.activities && $organizationStore.activities[0]);

	let selectedChart = $state<ChartType>(ChartType.ALL);

	let chartSeries = $state<number[]>([]);
	let labels = $state<string[]>([]);

	const hasDebit = $derived($accountPostingsStore?.some((p) => p.type === AccountPostingType.DEBIT) ?? false);

	const hasCredit = $derived($accountPostingsStore?.some((p) => p.type === AccountPostingType.CREDIT) ?? false);

	$effect(() => {
		switch (selectedChart) {
			case ChartType.CREDIT: {
				const credits = $accountPostingsStore?.filter((p) => p.type === AccountPostingType.CREDIT) ?? [];
				chartSeries = credits.map((credit) => credit.amountInCents);
				labels = credits.map((credit) => credit.purpose) ?? [];
				break;
			}
			case ChartType.DEBIT: {
				const debits = $accountPostingsStore?.filter((p) => p.type === AccountPostingType.DEBIT) ?? [];
				chartSeries = debits.map((debit) => debit.amountInCents);
				labels = debits.map((debit) => debit.purpose) ?? [];
				break;
			}
			default: {
				chartSeries = $accountPostingsStore?.map((posting) => posting.amountInCents) ?? [];
				labels = $accountPostingsStore?.map((posting) => posting.purpose) ?? [];
				break;
			}
		}
	});

	const chartOptions = $derived<ApexOptions>({
		chart: { type: 'pie', width: '100%' },
		dataLabels: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			formatter: (_: number, options: any): string => {
				const label = options.w.globals.labels[options.seriesIndex];
				const postingType = $accountPostingsStore?.find((posting) => posting.purpose === label)?.type;
				const formattedValue = formatter.currency(options.w.globals.series[options.seriesIndex]);
				return `${postingType === AccountPostingType.CREDIT ? '+' : '-'} ${formattedValue}`;
			}
		},
		labels,
		legend: { position: 'bottom' },
		plotOptions: { pie: { dataLabels: { offset: -15 } } },
		series: chartSeries
	});

	function onNavigateEvent(): void {
		if ($organizationStore?.activities[0]?.id) {
			goto(PageRoute.ORGANIZATION.ACTIVITIES.DETAIL($organizationStore.activities[0].id));
		}
	}

	async function navigate(_event: MouseEvent | undefined, route: PageRoutePaths): Promise<void> {
		_event?.stopPropagation();
		await goto(route);
	}

	function setSelectedChart(type: ChartType): void {
		selectedChart = type;
	}
</script>

<Layout title={$t('routes.home.title')}>
	{#if $userStore}
		{@render accountCard($userStore)}
		{#if $organizationStore}
			{#if activity}
				{@render upcomingEventCard(activity)}
			{/if}
			{@render organizationCard($organizationStore)}
			{@render budgetChartCard()}
		{:else}
			{@render noCollectiveCards()}
		{/if}
	{/if}
</Layout>

{#snippet accountCard(user: UserModel)}
	<Card color="transparent" classList="text-center" clicked={() => goto(PageRoute.ACCOUNT.ROOT)}>
		<div class="truncate">
			<ion-text class="text-2xl" color="dark">
				{$t('routes.home.card.user.title', { value: user.username })}
			</ion-text>
		</div>
		<Button
			fill="clear"
			color="medium"
			size="small"
			icon={notificationsOffOutline}
			label={$t('routes.home.card.notifications.no-notes')}
			clicked={featureNotImplementedAlert}
		/>
	</Card>
{/snippet}

{#snippet upcomingEventCard(activity: ActivityModel)}
	<Card title="Upcoming event" border="secondary" clicked={onNavigateEvent}>
		<div class="mb-3 flex flex-wrap items-center justify-center gap-5">
			<div class="flex items-center gap-2">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>{activity.name}</ion-text>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={calendarOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(addDays(new TZDate(), 5), {
						addSuffix: true,
						includeSeconds: true,
						locale: getDateFnsLocale($localeStore)
					})}
				</ion-text>
			</div>
		</div>
	</Card>
{/snippet}

{#snippet organizationCard(organization: OrganizationModel)}
	<Card border="primary" title={organization.name} clicked={() => goto(PageRoute.ORGANIZATION.ROOT)}>
		<div class="flex flex-wrap items-center justify-center">
			<Button
				size="small"
				fill="clear"
				color="dark"
				icon={peopleOutline}
				label={`${organization.personsOfOrganization.length} members`}
				clicked={(_event) => navigate(_event, PageRoute.ORGANIZATION.MEMBERS)}
			/>
			<Button
				icon={cashOutline}
				label={formatter.currency(accountPostingsStore.getTotalBudget())}
				size="small"
				fill="clear"
				color="dark"
				clicked={(_event) => navigate(_event, PageRoute.ORGANIZATION.ROOT)}
			/>
			<Button
				icon={flashOutline}
				label={`${$organizationStore?.activities.length ?? 0} activities`}
				size="small"
				fill="clear"
				color="dark"
				clicked={(_event) => navigate(_event, PageRoute.ORGANIZATION.ACTIVITIES.ROOT)}
			/>
		</div>
	</Card>
{/snippet}

{#snippet noCollectiveCards()}
	<Card title={$t('routes.home.card.register-organization.title')} classList="text-center">
		<Button
			clicked={() => goto(PageRoute.ORGANIZATION.REGISTER)}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.register')}
		/>
	</Card>
	<Card title={$t('routes.home.card.join-organization.title')} classList="text-center">
		<Button
			clicked={() => goto(PageRoute.ORGANIZATION.JOIN)}
			fill="outline"
			icon={accessibilityOutline}
			label={$t('routes.home.card.organization.join')}
		/>
	</Card>
{/snippet}

{#snippet budgetChartCard()}
	<Card>
		<div class="flex items-center justify-center gap-2">
			{#if hasCredit && hasDebit}
				<Chip
					icon={cashOutline}
					label="All"
					color="secondary"
					selected={selectedChart === ChartType.ALL}
					clicked={() => setSelectedChart(ChartType.ALL)}
				/>
				<Chip
					icon={trendingUp}
					label="Income"
					color="success"
					selected={selectedChart === ChartType.CREDIT}
					clicked={() => setSelectedChart(ChartType.CREDIT)}
				/>
				<Chip
					icon={trendingDown}
					label="Expenses"
					color="danger"
					selected={selectedChart === ChartType.DEBIT}
					clicked={() => setSelectedChart(ChartType.DEBIT)}
				/>
			{/if}
		</div>
		<Chart options={chartOptions}></Chart>
	</Card>
{/snippet}
