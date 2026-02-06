<script lang="ts">
	import type { ActivityTO, PostingTO } from '@kollapp/api-types';

	import { Capacitor } from '@capacitor/core';
	import { FileViewer } from '@capacitor/file-viewer';
	import { Directory, Filesystem } from '@capacitor/filesystem';
	import { Share } from '@capacitor/share';
	import { TZDate } from '@date-fns/tz';
	import { actionSheetController, loadingController } from '@ionic/core';
	import { EmailComposer } from 'capacitor-email-composer';
	import { toPng } from 'html-to-image';
	import {
		analyticsOutline,
		downloadOutline,
		eyeOutline,
		mailOutline,
		shareOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import { dev } from '$app/environment';

	import { budgetService } from '$lib/api/services';
	import { Card } from '$lib/components/core';
	import {
		ActivityRanking,
		CalendarHeatmap,
		MonthComparisonCard,
		MonthlyTrendChart
	} from '$lib/components/internal/budget/statistics';
	import CategoryStatistics from '$lib/components/internal/budget/statistics/CategoryStatistics.svelte';
	import MemberStatistics from '$lib/components/internal/budget/statistics/MemberStatistics.svelte';
	import OverviewCards from '$lib/components/internal/budget/statistics/OverviewCards.svelte';
	import SmartInsights from '$lib/components/internal/budget/statistics/SmartInsights.svelte';
	import { Layout } from '$lib/components/layout';
	import { FilterPanel, PostingItem } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { chipSection, dateRangeSection, type FilterConfig, Theme } from '$lib/models/ui';
	import { exportModeStore, organizationStore, themeStore } from '$lib/stores';
	import { informationModal, parser, showAlert } from '$lib/utility';

	type TimeRange = '12months' | '3months' | '6months' | 'all';
	type StatisticsFilterState = {
		dateRange: { from: string; to: string };
		timeRange: TimeRange;
	};

	let isEditingPosting = $state<boolean>(false);
	let stablePostings = $state<PostingTO[]>([]);
	let filterState = $state<StatisticsFilterState>();

	const isDarkMode = $derived($themeStore === Theme.DARK);

	const activityByPostingId = $derived<SvelteMap<number, ActivityTO>>(
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

	function handleSearch(value: string): void {
		const search = value.trim().toLowerCase();
		const cards = document.querySelectorAll('#statistics-content ion-card') as NodeListOf<HTMLIonCardElement>;

		for (const card of cards) {
			const cardTitle = card.querySelector('ion-card-title');
			card.style.display = !cardTitle || cardTitle?.textContent?.toLowerCase().includes(search) ? 'block' : 'none';
		}
	}

	const filteredPostings = $derived.by<PostingTO[]>(() => {
		if (!filterState) return stablePostings;

		if (filterState.timeRange === 'all') {
			if (filterState.dateRange.from || filterState.dateRange.to) {
				return stablePostings.filter((posting) => {
					const postingDate = new TZDate(posting.date);
					const from = new TZDate(filterState!.dateRange.from).getTime();
					const to = new TZDate(filterState!.dateRange.to).getTime();
					if (postingDate.getTime() < from) return false;
					if (postingDate.getTime() > to) return false;
					return true;
				});
			}
			return stablePostings;
		}

		const now = new TZDate();
		let months: number;
		if (filterState.timeRange === '3months') {
			months = 3;
		} else if (filterState.timeRange === '6months') {
			months = 6;
		} else {
			months = 12;
		}
		const cutoffDate = new TZDate(now.getFullYear(), now.getMonth() - months, now.getDate());

		return stablePostings.filter((p) => new TZDate(p.date) >= cutoffDate);
	});

	const filterConfig = $derived<FilterConfig<StatisticsFilterState>>({
		onApply: (state) => {
			filterState = state;
		},
		searchbar: {
			onSearch: handleSearch,
			placeholder: $t('routes.organization.budget-statistics.page.search.placeholder'),
			value: ''
		},
		sections: [
			chipSection<TimeRange>('timeRange', {
				defaultValue: 'all',
				label: $t('routes.organization.budget-statistics.page.filter.time-range'),
				options: [
					{ label: $t('routes.organization.budget-statistics.page.filter.all'), value: 'all' },
					{ label: $t('routes.organization.budget-statistics.page.filter.3months'), value: '3months' },
					{ label: $t('routes.organization.budget-statistics.page.filter.6months'), value: '6months' },
					{ label: $t('routes.organization.budget-statistics.page.filter.12months'), value: '12months' }
				]
			}),
			dateRangeSection('dateRange', {
				defaultFromValue: getMinPostingDate(),
				defaultToValue: getMaxPostingDate(),
				label: $t('routes.organization.budget-statistics.page.filter.custom'),
				max: getMaxPostingDate(),
				min: getMinPostingDate()
			})
		],
		state: filterState,
		title: $t('routes.organization.budget-statistics.page.filter.title')
	});

	async function handleExport(): Promise<void> {
		const actionSheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => viewStatistics(),
					icon: eyeOutline,
					text: $t('routes.organization.budget-statistics.page.export.view')
				},
				{
					handler: () => shareStatistics(),
					icon: shareOutline,
					text: $t('routes.organization.budget-statistics.page.export.share')
				},
				{
					handler: () => emailStatistics(),
					icon: mailOutline,
					text: $t('routes.organization.budget-statistics.page.export.email')
				},
				{
					handler: () => downloadStatistics(),
					icon: downloadOutline,
					text: $t('routes.organization.budget-statistics.page.export.download')
				}
			],
			header: $t('routes.organization.budget-statistics.page.export.header')
		});
		await actionSheet.present();
	}

	async function captureStatistics(): Promise<{ base64: string; blob: Blob } | undefined> {
		const element = document.querySelector('#statistics-content');
		if (!element) return;

		exportModeStore.set(true);

		await tick();

		const loader = await loadingController.create({
			message: $t('routes.organization.budget-statistics.page.export.capturing')
		});
		await loader.present();

		try {
			const dataUrl = await toPng(element as HTMLElement, {
				backgroundColor: getComputedStyle(document.body).backgroundColor,
				cacheBust: true,
				pixelRatio: 2
			});

			const response = await fetch(dataUrl);
			const blob = await response.blob();

			const reader = new FileReader();
			const base64 = await new Promise<string>((resolve) => {
				reader.onloadend = () => resolve(reader.result as string);
				reader.readAsDataURL(blob);
			});

			await loader.dismiss();
			exportModeStore.set(false);
			return { base64, blob };
		} catch (error) {
			await loader.dismiss();
			exportModeStore.set(false);
			await showAlert($t('routes.organization.budget-statistics.page.export.error'));
			console.error('Error capturing statistics:', error);
			return;
		}
	}

	function getFilename(): string {
		return `budget-statistics-${new Date().toISOString().split('T')[0]}.png`;
	}

	async function viewStatistics(): Promise<void> {
		if (dev) {
			return showAlert($t('routes.organization.budget-statistics.page.export.view-unsupported'));
		}
		const result = await captureStatistics();
		if (!result) return;

		try {
			const writeResult = await Filesystem.writeFile({
				data: result.base64,
				directory: Directory.Cache,
				path: getFilename()
			});

			await FileViewer.openDocumentFromLocalPath({
				path: writeResult.uri
			});
		} catch (error) {
			await showAlert($t('routes.organization.budget-statistics.page.export.view-error'));
			console.error('Error viewing statistics:', error);
		}
	}

	async function shareStatistics(): Promise<void> {
		if (dev) {
			return showAlert($t('routes.organization.budget-statistics.page.export.share-unsupported'));
		}
		const result = await captureStatistics();
		if (!result) return;

		try {
			const writeResult = await Filesystem.writeFile({
				data: result.base64,
				directory: Directory.Cache,
				path: getFilename()
			});

			await Share.share({
				dialogTitle: $t('routes.organization.budget-statistics.page.export.share-dialog'),
				files: [writeResult.uri],
				title: $t('routes.organization.budget-statistics.page.export.share-title')
			});
		} catch (error) {
			await showAlert($t('routes.organization.budget-statistics.page.export.share-error'));
			console.error('Error sharing statistics:', error);
		}
	}

	async function emailStatistics(): Promise<void> {
		if (dev) {
			return showAlert($t('routes.organization.budget-statistics.page.export.email-unsupported'));
		}

		const result = await captureStatistics();
		if (!result) return;

		try {
			const hasAccountResult = await EmailComposer.hasAccount();

			if (!hasAccountResult.hasAccount) {
				return showAlert($t('routes.organization.budget-statistics.page.export.email-no-account'));
			}

			await EmailComposer.open({
				attachments: [
					{
						name: getFilename(),
						path: result.base64,
						type: 'base64'
					}
				],
				subject: $t('routes.organization.budget-statistics.page.export.email-subject')
			});
		} catch (error) {
			await showAlert($t('routes.organization.budget-statistics.page.export.email-error'));
			console.error('Error emailing statistics:', error);
		}
	}

	async function downloadStatistics(result?: { base64: string; blob: Blob }): Promise<void> {
		if (!result) {
			result = await captureStatistics();
			if (!result) return;
		}

		try {
			if (Capacitor.isNativePlatform()) {
				const filename = getFilename();
				await Filesystem.writeFile({
					data: result.base64,
					directory: Directory.Documents,
					path: filename
				});
				await informationModal(
					$t('routes.organization.budget-statistics.page.export.download-success-title'),
					$t('routes.organization.budget-statistics.page.export.download-success-message', { value: filename })
				);
			} else {
				const url = URL.createObjectURL(result.blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = getFilename();
				document.body.append(link);
				link.click();
				link.remove();
				URL.revokeObjectURL(url);
			}
		} catch (error) {
			await showAlert($t('routes.organization.budget-statistics.page.export.download-error'));
			console.error('Error downloading statistics:', error);
		}
	}

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
	const averageTransaction = $derived(transactionCount > 0 ? (totalCredit + totalDebit) / transactionCount : 0);

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

	$effect(() => {
		if (!isEditingPosting) {
			stablePostings = [...postings];
		}
	});

	function getMinPostingDate(): string {
		return stablePostings.length > 0
			? parser.date(new TZDate(Math.min(...stablePostings.map((posting) => new TZDate(posting.date).getTime()))))
			: parser.date(new TZDate());
	}

	function getMaxPostingDate(): string {
		return stablePostings.length > 0
			? parser.date(new TZDate(Math.max(...stablePostings.map((posting) => new TZDate(posting.date).getTime()))))
			: parser.date(new TZDate());
	}
</script>

<Layout title={$t('routes.organization.budget-statistics.page.title')} showBackButton>
	{#if stablePostings.length === 0}
		{@render emptyState()}
	{:else}
		<div class="sticky top-0 left-0 z-10">
			<FilterPanel config={filterConfig} onAction={handleExport} />
		</div>
		<div id="statistics-content">
			{@render transactionCountNote()}
			<div class="mt-4 grid grid-cols-1 md:grid-cols-2">
				<OverviewCards {averageTransaction} {balance} {totalCredit} {totalDebit} />

				<SmartInsights postings={filteredPostings} categories={$organizationStore?.budgetCategories ?? []} />

				<MonthComparisonCard postings={stablePostings} />

				<MonthlyTrendChart postings={filteredPostings} {isDarkMode} />

				<CategoryStatistics
					budgetCategories={$organizationStore?.budgetCategories ?? []}
					postings={filteredPostings}
					{isDarkMode}
				/>

				<MemberStatistics
					postings={filteredPostings}
					personsOfOrganization={$organizationStore?.personsOfOrganization ?? []}
				/>

				<ActivityRanking activities={$organizationStore?.activities ?? []} />

				<CalendarHeatmap postings={stablePostings} />

				{@render topTransactionsCards()}
			</div>
		</div>
	{/if}
</Layout>

{#snippet emptyState()}
	<div class="flex flex-col items-center justify-center py-10">
		<ion-icon icon={analyticsOutline} class="text-6xl text-gray-400"></ion-icon>
		<ion-note class="mt-4">{$t('routes.organization.budget-statistics.page.no-postings')}</ion-note>
	</div>
{/snippet}

{#snippet transactionCountNote()}
	<div class="mt-4 text-center">
		<ion-note>
			{$t('routes.organization.budget-statistics.page.transaction-count', { value: transactionCount })}
		</ion-note>
	</div>
{/snippet}

{#snippet topTransactionsCards()}
	{#if topCredits.length > 0}
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
{/snippet}
