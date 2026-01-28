<script lang="ts">
	import type { QuickAccessItem } from '$lib/models/ui';
	import type { ActivityTO, OrganizationTO, PostingTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { useSortable } from '@dnd-kit-svelte/svelte/sortable';
	import { formatDistanceToNow } from 'date-fns';
	import {
		arrowForwardOutline,
		calendarClearOutline,
		cardOutline,
		closeOutline,
		flashOutline,
		peopleOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import BudgetChart from '$lib/components/widgets/budget/BudgetChart.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/ui';
	import { localeStore, organizationStore } from '$lib/stores';
	import { getDateFnsLocale } from '$lib/utility';

	type Properties = {
		activity: ActivityTO | undefined;
		editMode: boolean;
		index: number;
		item: QuickAccessItem;
		postings: PostingTO[];
		isOverlay?: boolean;
		organization?: OrganizationTO;
		onPointerDown: () => void;
		onPointerUp: () => void;
		onRemove: (id: string) => void;
	};

	let {
		activity,
		editMode,
		index,
		isOverlay = false,
		item,
		onPointerDown,
		onPointerUp,
		onRemove,
		organization,
		postings
	}: Properties = $props();

	const { isDragging, ref } = useSortable({
		disabled: () => !editMode,
		group: 'items',
		id: item.id,
		index: () => index
	});

	async function onNavigateActivity(): Promise<void> {
		await (activity?.id
			? goto(resolve('/organization/activities/[slug]', { slug: activity.id.toString() }))
			: goto(resolve('/organization/activities')));
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative col-span-2 select-none"
	class:wiggle={editMode && !isDragging.current}
	class:invisible={isDragging.current && !isOverlay}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onpointerleave={onPointerUp}
	{@attach ref}
>
	{#if item.widgetType === 'special'}
		{#if item.specialWidgetId === 'organization-card'}
			{@render organizationCard()}
		{:else if item.specialWidgetId === 'upcoming-activity-card'}
			{@render upcomingActivityCard()}
		{:else if item.specialWidgetId === 'budget-chart-card'}
			{@render budgetChartCard()}
		{/if}
	{/if}

	{#if editMode && !isDragging.current}
		<Button
			size="small"
			color="danger"
			classList="absolute top-0 right-0 z-10"
			clicked={() => onRemove(item.id)}
			icon={closeOutline}
		/>
	{/if}
</div>

{#snippet organizationCard()}
	<Card
		border="primary"
		title={organization?.name}
		clicked={editMode ? undefined : () => goto(resolve('/organization'))}
		titleIconEnd={editMode ? undefined : arrowForwardOutline}
		tourId={TourStepId.HOME.ORGANIZATION}
		readonly={editMode}
	>
		<ion-note class="flex flex-wrap items-center justify-center gap-3 text-sm">
			<div class="flex items-center gap-1">
				<ion-icon icon={peopleOutline}></ion-icon>
				<ion-text>
					{$t('routes.page.page.organization-card.card.members', {
						value: organization?.personsOfOrganization.length
					})}
				</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={flashOutline}></ion-icon>
				<ion-text>
					{$t('routes.page.page.organization-card.card.activities', {
						value: $organizationStore?.activities.length ?? 0
					})}
				</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={cardOutline}></ion-icon>
				<ion-text>
					{$t('routes.page.page.organization-card.card.postings', {
						value:
							($organizationStore?.organizationPostings.length ?? 0) +
							($organizationStore?.activities.reduce((total, act) => total + act.activityPostings.length, 0) ?? 0)
					})}
				</ion-text>
			</div>
		</ion-note>
	</Card>
{/snippet}

{#snippet upcomingActivityCard()}
	<Card
		tourId={TourStepId.HOME.UPCOMING_ACTIVITY}
		title={$t('routes.page.page.upcoming-activity-card.card.title')}
		border="secondary"
		clicked={editMode ? undefined : onNavigateActivity}
		titleIconEnd={editMode || !activity ? undefined : arrowForwardOutline}
		readonly={editMode}
	>
		{#if activity}
			<ion-note class="flex flex-wrap items-center justify-center gap-3 text-sm">
				<div class="flex items-center gap-1">
					<ion-icon icon={flashOutline}></ion-icon>
					<ion-text>{activity.name}</ion-text>
				</div>
				<div class="flex items-center gap-1">
					<ion-icon icon={calendarClearOutline}></ion-icon>
					<ion-text>
						{formatDistanceToNow(new TZDate(activity.date), {
							addSuffix: true,
							locale: getDateFnsLocale($localeStore)
						})}
					</ion-text>
				</div>
				<div class="flex items-center gap-1">
					<ion-icon icon={cardOutline}></ion-icon>
					<ion-text>{activity.activityPostings.length}</ion-text>
				</div>
			</ion-note>
		{:else}
			<ion-note class="block text-center text-sm">
				{$t('routes.page.page.upcoming-activity-card.card.no-upcoming-activity')}
			</ion-note>
		{/if}
	</Card>
{/snippet}

{#snippet budgetChartCard()}
	<BudgetChart {editMode} {postings} tourId={TourStepId.HOME.BUDGET_CHART} />
{/snippet}

<style>
	@keyframes wiggle {
		0%,
		100% {
			transform: rotate(-0.5deg);
		}
		50% {
			transform: rotate(0.5deg);
		}
	}

	.wiggle {
		animation: wiggle 0.3s ease-in-out infinite;
	}

	.wiggle:nth-child(2n) {
		animation-delay: 0.075s;
	}
</style>
