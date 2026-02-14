<script lang="ts">
	import type { PostingTO } from '@kollapp/api-types';

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
		flashOutline,
		mailOutline,
		peopleOutline,
		shareOutline,
		trendingUpOutline
	} from 'ionicons/icons';
	import { onMount, tick } from 'svelte';

	import { dev } from '$app/environment';

	import {
		ActivityBar,
		ActivityEfficiency,
		CategoryDonut,
		HeroBalance,
		PersonOfOrganizationBar,
		PostingsHeatmap,
		SectionDivider,
		SmartInsights,
		TopTransactions,
		UnifiedTimeline,
		WeekdayAnalysis
	} from '$lib/components/internal/budget/statistics';
	import { Layout } from '$lib/components/layout';
	import { FilterPanel } from '$lib/components/shared';
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
		| 'activity-bar'
		| 'calendar-heatmap'
		| 'category-donut'
		| 'event-efficiency'
		| 'hero-balance'
		| 'member-bar'
		| 'smart-insights'
		| 'timeline'
		| 'top-transactions'
		| 'weekday-analysis';
	type StatisticsFilterState = {
		dateRange: { from: string; to: string };
		timeRange: TimeRange;
		visibleCards: number[];
	};

	const ALL_CARDS: StatisticsCard[] = [
		'hero-balance',
		'smart-insights',
		'timeline',
		'calendar-heatmap',
		'category-donut',
		'member-bar',
		'activity-bar',
		'top-transactions',
		'event-efficiency',
		'weekday-analysis'
	];

	const CARD_LABELS: Record<StatisticsCard, string> = {
		'activity-bar': $t('routes.organization.budget-statistics.page.activities.title'),
		'calendar-heatmap': $t('routes.organization.budget-statistics.page.heatmap.title'),
		'category-donut': $t('routes.organization.budget-statistics.page.category-statistics.title'),
		'event-efficiency': $t('routes.organization.budget-statistics.page.event-efficiency.title'),
		'hero-balance': $t('routes.organization.budget-statistics.page.overview.title'),
		'member-bar': $t('routes.organization.budget-statistics.page.member-statistics.title'),
		'smart-insights': $t('routes.organization.budget-statistics.page.insights.title'),
		timeline: $t('routes.organization.budget-statistics.page.trend.title'),
		'top-transactions': $t('routes.organization.budget-statistics.page.top-transactions.title'),
		'weekday-analysis': $t('routes.organization.budget-statistics.page.weekday.title')
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
		return `budget-statistics${suffix}-${new TZDate().toISOString().split('T')[0]}.png`;
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

			<!-- Section 1 -->
			<div style="border-left: 3px solid var(--ion-color-primary); margin-left: 4px; padding-left: 0;">
				<SectionDivider
					color="primary"
					icon={flashOutline}
					title={$t('routes.organization.budget-statistics.page.sections.quick-glance')}
					subtitle={$t('routes.organization.budget-statistics.page.sections.quick-glance-sub')}
				/>
				<div class="grid grid-cols-1 md:grid-cols-2">
					{#if isCardVisible('hero-balance')}
						<div data-card-id="hero-balance">
							<HeroBalance
								{averageTransaction}
								{balance}
								postings={filteredPostings}
								{totalCredit}
								{totalDebit}
								{transactionCount}
								onDownload={cardDownload('hero-balance')}
							/>
						</div>
					{/if}

					{#if isCardVisible('smart-insights')}
						<div data-card-id="smart-insights">
							<SmartInsights
								activities={$organizationStore?.activities ?? []}
								categories={$organizationStore?.budgetCategories ?? []}
								postings={filteredPostings}
								onDownload={cardDownload('smart-insights')}
							/>
						</div>
					{/if}
				</div>
			</div>

			<!-- Section 2 -->
			<div style="border-left: 3px solid var(--ion-color-secondary); margin-left: 4px; padding-left: 0;">
				<SectionDivider
					color="secondary"
					icon={trendingUpOutline}
					title={$t('routes.organization.budget-statistics.page.sections.trends')}
					subtitle={$t('routes.organization.budget-statistics.page.sections.trends-sub')}
				/>
				<div class="grid grid-cols-1 md:grid-cols-2">
					{#if isCardVisible('timeline')}
						<div data-card-id="timeline">
							<UnifiedTimeline postings={filteredPostings} {isDarkMode} onDownload={cardDownload('timeline')} />
						</div>
					{/if}

					{#if isCardVisible('calendar-heatmap')}
						<div data-card-id="calendar-heatmap">
							<PostingsHeatmap postings={filteredPostings} onDownload={cardDownload('calendar-heatmap')} />
						</div>
					{/if}
				</div>
			</div>

			<!-- Section 3 -->
			<div style="border-left: 3px solid var(--ion-color-tertiary); margin-left: 4px; padding-left: 0;">
				<SectionDivider
					color="tertiary"
					icon={peopleOutline}
					title={$t('routes.organization.budget-statistics.page.sections.breakdown')}
					subtitle={$t('routes.organization.budget-statistics.page.sections.breakdown-sub')}
				/>
				<div class="grid grid-cols-1 md:grid-cols-2">
					{#if isCardVisible('category-donut')}
						<div data-card-id="category-donut">
							<CategoryDonut
								budgetCategories={$organizationStore?.budgetCategories ?? []}
								postings={filteredPostings}
								{isDarkMode}
								onDownload={cardDownload('category-donut')}
							/>
						</div>
					{/if}

					{#if isCardVisible('member-bar')}
						<div data-card-id="member-bar">
							<PersonOfOrganizationBar
								{isDarkMode}
								postings={filteredPostings}
								personsOfOrganization={$organizationStore?.personsOfOrganization ?? []}
								onDownload={cardDownload('member-bar')}
							/>
						</div>
					{/if}

					{#if isCardVisible('activity-bar')}
						<div data-card-id="activity-bar">
							<ActivityBar
								activities={$organizationStore?.activities ?? []}
								{isDarkMode}
								onDownload={cardDownload('activity-bar')}
							/>
						</div>
					{/if}

					{#if isCardVisible('top-transactions')}
						<div data-card-id="top-transactions">
							<TopTransactions
								postings={filteredPostings}
								onDownload={cardDownload('top-transactions')}
								onEditStart={() => (isEditingPosting = true)}
								onEditEnd={() => (isEditingPosting = false)}
							/>
						</div>
					{/if}

					{#if isCardVisible('event-efficiency')}
						<div data-card-id="event-efficiency">
							<ActivityEfficiency
								activities={$organizationStore?.activities ?? []}
								onDownload={cardDownload('event-efficiency')}
							/>
						</div>
					{/if}

					{#if isCardVisible('weekday-analysis')}
						<div data-card-id="weekday-analysis">
							<WeekdayAnalysis postings={filteredPostings} {isDarkMode} onDownload={cardDownload('weekday-analysis')} />
						</div>
					{/if}
				</div>
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
