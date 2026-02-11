<script lang="ts">
	import type { FilterConfig } from '$lib/models/ui';
	import type { PersonOfOrganizationTO, PostingTO } from '@kollapp/api-types';
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { downloadOutline, listOutline, peopleOutline } from 'ionicons/icons';

	import { Button, Card, Modal } from '$lib/components/core';
	import { StatisticItem } from '$lib/components/internal/budget/statistics';
	import { FilterPanel } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { chipSection } from '$lib/models/ui';
	import { formatter } from '$lib/utility';

	type Properties = {
		isDarkMode: boolean;
		personsOfOrganization: PersonOfOrganizationTO[];
		postings: PostingTO[];
		onDownload?: () => void;
	};

	type MemberNetStats = {
		credit: number;
		debit: number;
		net: number;
		personOfOrganization: PersonOfOrganizationTO;
		volumeShare: number;
	};

	type SortKey = 'credit' | 'debit' | 'name' | 'net' | 'volume';
	type SortOrder = 'asc' | 'desc';
	type MemberFilterState = {
		sortBy: SortKey;
		sortOrder: SortOrder;
	};

	let { isDarkMode, onDownload, personsOfOrganization, postings }: Properties = $props();

	const PERSON_OF_ORGANIZATION_COUNT_TRESHOLD = 4;

	let modalOpen = $state<boolean>(false);
	let searchValue = $state<string>('');
	let sortBy = $state<SortKey>('net');
	let sortOrder = $state<SortOrder>('desc');
	let filterState = $state<MemberFilterState>();

	const totalVolume = $derived(postings.reduce((sum, p) => sum + p.amountInCents, 0));

	const statistics = $derived.by<MemberNetStats[]>(() => {
		return personsOfOrganization
			.map((personOfOrganization) => {
				const memberPostings = postings.filter((p) => p.personOfOrganizationId === personOfOrganization.id);
				const credit = memberPostings.filter((p) => p.type === 'CREDIT').reduce((sum, p) => sum + p.amountInCents, 0);
				const debit = memberPostings.filter((p) => p.type === 'DEBIT').reduce((sum, p) => sum + p.amountInCents, 0);
				const memberVolume = credit + debit;
				const volumeShare = totalVolume > 0 ? (memberVolume / totalVolume) * 100 : 0;

				return { credit, debit, net: credit - debit, personOfOrganization, volumeShare };
			})
			.filter((s) => s.credit > 0 || s.debit > 0)
			.toSorted((a, b) => b.net - a.net);
	});

	const filteredAndSortedStats = $derived.by<MemberNetStats[]>(() => {
		const search = searchValue.trim().toLowerCase();
		const filtered =
			search === ''
				? statistics
				: statistics.filter((s) => s.personOfOrganization.username.toLowerCase().includes(search));

		return [...filtered].toSorted((a, b) => {
			let cmp = 0;
			switch (sortBy) {
				case 'name': {
					cmp = a.personOfOrganization.username.localeCompare(b.personOfOrganization.username);
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
				case 'volume': {
					cmp = a.volumeShare - b.volumeShare;
					break;
				}
			}
			return sortOrder === 'desc' ? -cmp : cmp;
		});
	});

	const modalFilterConfig = $derived<FilterConfig<MemberFilterState>>({
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
					{ label: $t('components.posting-overview.filter.sort.person-of-organization'), value: 'name' },
					{ label: $t('routes.organization.budget-statistics.page.chart.credit'), value: 'credit' },
					{ label: $t('routes.organization.budget-statistics.page.chart.debit'), value: 'debit' },
					{ label: $t('routes.organization.budget-statistics.page.member-statistics.net'), value: 'net' },
					{ label: $t('routes.organization.budget-statistics.page.member-statistics.volume'), value: 'volume' }
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
		labels: statistics.slice(0, PERSON_OF_ORGANIZATION_COUNT_TRESHOLD).map((s) => s.personOfOrganization.username),
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
				data: statistics.slice(0, PERSON_OF_ORGANIZATION_COUNT_TRESHOLD).map((s) => s.credit / 100),
				name: $t('routes.organization.budget-statistics.page.chart.credit')
			},
			{
				data: statistics.slice(0, PERSON_OF_ORGANIZATION_COUNT_TRESHOLD).map((s) => s.debit / 100),
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
				},
				trim: true
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
	title={$t('routes.organization.budget-statistics.page.member-statistics.title')}
	titleIconStart={peopleOutline}
	titleIconEnd={onDownload ? downloadOutline : undefined}
	titleIconEndClicked={onDownload}
	lazy
>
	{#if statistics.length === 0}
		<ion-text color="medium">
			{$t('routes.organization.budget-statistics.page.member-statistics.no-data')}
		</ion-text>
	{:else}
		<Chart options={chartOptions}></Chart>

		{#each statistics.slice(0, PERSON_OF_ORGANIZATION_COUNT_TRESHOLD) as stat (stat.personOfOrganization.id)}
			<StatisticItem
				label={stat.personOfOrganization.username}
				credit={stat.credit}
				debit={stat.debit}
				total={stat.net}
				note="{stat.volumeShare.toFixed(1)}% {$t(
					'routes.organization.budget-statistics.page.member-statistics.volume'
				)}"
			/>
		{/each}
		{#if statistics.length > PERSON_OF_ORGANIZATION_COUNT_TRESHOLD}
			<div class="mt-2 flex justify-center">
				<Button
					fill="clear"
					size="small"
					label={$t('routes.organization.budget-statistics.page.member-statistics.show-all')}
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
				<ion-note>{$t('routes.organization.budget-statistics.page.member-statistics.no-data')}</ion-note>
			</div>
		{:else}
			<ion-list>
				{#each filteredAndSortedStats as stat (stat.personOfOrganization.id)}
					<StatisticItem
						label={stat.personOfOrganization.username}
						credit={stat.credit}
						debit={stat.debit}
						total={stat.net}
						note="{stat.volumeShare.toFixed(1)}% {$t(
							'routes.organization.budget-statistics.page.member-statistics.volume'
						)}"
					/>
				{/each}
			</ion-list>
		{/if}
	</div>
</Modal>
