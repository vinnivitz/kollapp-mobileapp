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
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';

	import { dev } from '$app/environment';

	import { budgetService } from '$lib/api/services';
	import { Card } from '$lib/components/core';
	import {
		ActivityRanking,
		CategoryStatistics,
		Highlights,
		MedianStatistics,
		MemberStatistics,
		MonthComparisonCard,
		MonthlyCashflow,
		MonthlyTrendChart,
		OverviewCards,
		PostingsHeatmap
	} from '$lib/components/internal/budget/statistics';
	import { Layout } from '$lib/components/layout';
	import { FilterPanel, PostingItem } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { StorageKey } from '$lib/models/storage';
	import {
		chipSection,
		dateRangeSection,
		type FilterConfig,
		multiSelectSection,
		Theme,
		TourStepId
	} from '$lib/models/ui';
	import { exportModeStore, organizationStore, themeStore } from '$lib/stores';
	import { getStoredValue, informationModal, parser, showAlert, storeValue } from '$lib/utility';

	type TimeRange = '12months' | '3months' | '6months' | 'all';
	type StatisticsCard =
		| 'activity-ranking'
		| 'calendar-heatmap'
		| 'cashflow'
		| 'categories'
		| 'highlights'
		| 'median'
		| 'members'
		| 'month-comparison'
		| 'monthly-trend'
		| 'overview'
		| 'top-transactions';
	type StatisticsFilterState = {
		dateRange: { from: string; to: string };
		timeRange: TimeRange;
		visibleCards: number[];
	};

	const ALL_CARDS: StatisticsCard[] = [
		'overview',
		'highlights',
		'month-comparison',
		'monthly-trend',
		'categories',
		'members',
		'activity-ranking',
		'calendar-heatmap',
		'median',
		'cashflow',
		'top-transactions'
	];

	const CARD_LABELS: Record<StatisticsCard, string> = {
		'activity-ranking': $t('routes.organization.budget-statistics.page.activities.title'),
		'calendar-heatmap': $t('routes.organization.budget-statistics.page.heatmap.title'),
		cashflow: $t('routes.organization.budget-statistics.page.cashflow.title'),
		categories: $t('routes.organization.budget-statistics.page.categories.title'),
		highlights: $t('routes.organization.budget-statistics.page.insights.title'),
		median: $t('routes.organization.budget-statistics.page.median.title'),
		members: $t('routes.organization.budget-statistics.page.members.title'),
		'month-comparison': $t('routes.organization.budget-statistics.page.comparison.title'),
		'monthly-trend': $t('routes.organization.budget-statistics.page.trend.title'),
		overview: $t('routes.organization.budget-statistics.page.overview.title'),
		'top-transactions': $t('routes.organization.budget-statistics.page.top-credits.title')
	};

	let isEditingPosting = $state<boolean>(false);
	let stablePostings = $state<PostingTO[]>([]);
	let filterState = $state<StatisticsFilterState>();
	let visibleCards = $state<number[]>(ALL_CARDS.map((_, index) => index));

	function isCardVisible(card: StatisticsCard): boolean {
		return visibleCards.includes(ALL_CARDS.indexOf(card));
	}

	const isDarkMode = $derived($themeStore === Theme.DARK);
	const isExporting = $derived($exportModeStore);

	function cardDownload(cardId: StatisticsCard): (() => void) | undefined {
		return isExporting ? undefined : () => handleCardExport(cardId);
	}

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
			if (state.visibleCards) {
				visibleCards = state.visibleCards;
				void storeValue(StorageKey.BUDGET_STATISTICS_VISIBLE_CARDS, state.visibleCards);
			}
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
			}),
			multiSelectSection('visibleCards', {
				allSelectedText: $t('routes.organization.budget-statistics.page.filter.visible-cards-all'),
				icon: analyticsOutline,
				inputLabel: $t('routes.organization.budget-statistics.page.filter.visible-cards'),
				items: ALL_CARDS.map((card, index) => ({
					data: {
						id: index,
						label: CARD_LABELS[card]
					},
					selected: true
				})),
				label: $t('routes.organization.budget-statistics.page.filter.visible-cards')
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

	async function captureCard(cardId: StatisticsCard): Promise<{ base64: string; blob: Blob } | undefined> {
		const element = document.querySelector(`[data-card-id="${cardId}"]`);
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
			console.error('Error capturing card:', error);
			return;
		}
	}

	async function handleCardExport(cardId: StatisticsCard): Promise<void> {
		const actionSheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => viewCard(cardId),
					icon: eyeOutline,
					text: $t('routes.organization.budget-statistics.page.export.view')
				},
				{
					handler: () => shareCard(cardId),
					icon: shareOutline,
					text: $t('routes.organization.budget-statistics.page.export.share')
				},
				{
					handler: () => emailCard(cardId),
					icon: mailOutline,
					text: $t('routes.organization.budget-statistics.page.export.email')
				},
				{
					handler: () => downloadCard(cardId),
					icon: downloadOutline,
					text: $t('routes.organization.budget-statistics.page.export.download')
				}
			],
			header: CARD_LABELS[cardId]
		});
		await actionSheet.present();
	}

	async function viewCard(cardId: StatisticsCard): Promise<void> {
		if (dev) {
			return showAlert($t('routes.organization.budget-statistics.page.export.view-unsupported'));
		}
		const result = await captureCard(cardId);
		if (!result) return;

		try {
			const writeResult = await Filesystem.writeFile({
				data: result.base64,
				directory: Directory.Cache,
				path: getFilename(cardId)
			});

			await FileViewer.openDocumentFromLocalPath({
				path: writeResult.uri
			});
		} catch (error) {
			await showAlert($t('routes.organization.budget-statistics.page.export.view-error'));
			console.error('Error viewing card:', error);
		}
	}

	async function shareCard(cardId: StatisticsCard): Promise<void> {
		if (dev) {
			return showAlert($t('routes.organization.budget-statistics.page.export.share-unsupported'));
		}
		const result = await captureCard(cardId);
		if (!result) return;

		try {
			const writeResult = await Filesystem.writeFile({
				data: result.base64,
				directory: Directory.Cache,
				path: getFilename(cardId)
			});

			await Share.share({
				dialogTitle: $t('routes.organization.budget-statistics.page.export.share-dialog'),
				files: [writeResult.uri],
				title: $t('routes.organization.budget-statistics.page.export.share-title')
			});
		} catch (error) {
			await showAlert($t('routes.organization.budget-statistics.page.export.share-error'));
			console.error('Error sharing card:', error);
		}
	}

	async function emailCard(cardId: StatisticsCard): Promise<void> {
		if (dev) {
			return showAlert($t('routes.organization.budget-statistics.page.export.email-unsupported'));
		}

		const result = await captureCard(cardId);
		if (!result) return;

		try {
			const hasAccountResult = await EmailComposer.hasAccount();

			if (!hasAccountResult.hasAccount) {
				return showAlert($t('routes.organization.budget-statistics.page.export.email-no-account'));
			}

			await EmailComposer.open({
				attachments: [
					{
						name: getFilename(cardId),
						path: result.base64,
						type: 'base64'
					}
				],
				subject: $t('routes.organization.budget-statistics.page.export.email-subject')
			});
		} catch (error) {
			await showAlert($t('routes.organization.budget-statistics.page.export.email-error'));
			console.error('Error emailing card:', error);
		}
	}

	async function downloadCard(cardId: StatisticsCard): Promise<void> {
		const result = await captureCard(cardId);
		if (!result) return;
		await downloadStatistics(result, cardId);
	}

	function getFilename(cardId?: StatisticsCard): string {
		const suffix = cardId ? `-${cardId}` : '';
		return `budget-statistics${suffix}-${new Date().toISOString().split('T')[0]}.png`;
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

	async function downloadStatistics(result?: { base64: string; blob: Blob }, cardId?: StatisticsCard): Promise<void> {
		if (!result) {
			result = await captureStatistics();
			if (!result) return;
		}

		try {
			if (Capacitor.isNativePlatform()) {
				const filename = getFilename(cardId);
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
				link.download = getFilename(cardId);
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

	onMount(async () => {
		const storedVisibleCards = await getStoredValue<number[]>(StorageKey.BUDGET_STATISTICS_VISIBLE_CARDS);
		if (storedVisibleCards) {
			visibleCards = storedVisibleCards;
		}
	});
</script>

<Layout title={$t('routes.organization.budget-statistics.page.title')} showBackButton>
	{#if stablePostings.length === 0}
		{@render emptyState()}
	{:else}
		<div class="sticky top-0 left-0 z-10">
			<FilterPanel config={filterConfig} onAction={handleExport} />
		</div>
		<div id="statistics-content" data-tour={TourStepId.BUDGET_STATISTICS.CHARTS}>
			{@render transactionCountNote()}
			<div class="mt-4 grid grid-cols-1 md:grid-cols-2">
				{#if isCardVisible('overview')}
					<div data-card-id="overview">
						<OverviewCards
							{averageTransaction}
							{balance}
							{totalCredit}
							{totalDebit}
							onDownload={cardDownload('overview')}
						/>
					</div>
				{/if}

				{#if isCardVisible('highlights')}
					<div data-card-id="highlights">
						<Highlights
							postings={filteredPostings}
							categories={$organizationStore?.budgetCategories ?? []}
							onDownload={cardDownload('highlights')}
						/>
					</div>
				{/if}

				{#if isCardVisible('month-comparison')}
					<div data-card-id="month-comparison">
						<MonthComparisonCard postings={filteredPostings} onDownload={cardDownload('month-comparison')} />
					</div>
				{/if}

				{#if isCardVisible('monthly-trend')}
					<div data-card-id="monthly-trend">
						<MonthlyTrendChart postings={filteredPostings} {isDarkMode} onDownload={cardDownload('monthly-trend')} />
					</div>
				{/if}

				{#if isCardVisible('categories')}
					<div data-card-id="categories">
						<CategoryStatistics
							budgetCategories={$organizationStore?.budgetCategories ?? []}
							postings={filteredPostings}
							{isDarkMode}
							onDownload={cardDownload('categories')}
						/>
					</div>
				{/if}

				{#if isCardVisible('members')}
					<div data-card-id="members">
						<MemberStatistics
							{isDarkMode}
							postings={filteredPostings}
							personsOfOrganization={$organizationStore?.personsOfOrganization ?? []}
							onDownload={cardDownload('members')}
						/>
					</div>
				{/if}

				{#if isCardVisible('activity-ranking')}
					<div data-card-id="activity-ranking">
						<ActivityRanking
							activities={$organizationStore?.activities ?? []}
							onDownload={cardDownload('activity-ranking')}
						/>
					</div>
				{/if}

				{#if isCardVisible('calendar-heatmap')}
					<div data-card-id="calendar-heatmap">
						<PostingsHeatmap postings={filteredPostings} onDownload={cardDownload('calendar-heatmap')} />
					</div>
				{/if}

				{#if isCardVisible('median')}
					<div data-card-id="median">
						<MedianStatistics postings={filteredPostings} onDownload={cardDownload('median')} />
					</div>
				{/if}

				{#if isCardVisible('cashflow')}
					<div data-card-id="cashflow">
						<MonthlyCashflow postings={filteredPostings} {isDarkMode} onDownload={cardDownload('cashflow')} />
					</div>
				{/if}

				{#if isCardVisible('top-transactions')}
					<div data-card-id="top-transactions">
						{@render topTransactionsCards()}
					</div>
				{/if}
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
			titleIconEnd={isExporting ? undefined : downloadOutline}
			titleIconEndClicked={cardDownload('top-transactions')}
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
			titleIconEnd={isExporting ? undefined : downloadOutline}
			titleIconEndClicked={cardDownload('top-transactions')}
		>
			{#each topDebits as posting (posting.id)}
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
{/snippet}
