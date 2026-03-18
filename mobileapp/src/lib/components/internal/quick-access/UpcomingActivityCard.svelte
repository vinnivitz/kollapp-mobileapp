<script lang="ts">
	import type { ActivityTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { formatDistanceToNow } from 'date-fns';
	import {
		arrowForwardOutline,
		calendarClearOutline,
		calendarOutline,
		cashOutline,
		flashOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { Card } from '$lib/components/core';
	import { IconLabel } from '$lib/components/core/display';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/ui';
	import { localeStore } from '$lib/stores';
	import { getDateFnsLocale } from '$lib/utility';

	type Properties = {
		editMode: boolean;
		activity?: ActivityTO;
	};

	let { activity, editMode }: Properties = $props();

	async function onNavigateActivity(): Promise<void> {
		await (activity?.id
			? goto(resolve('/organization/activities/[slug]', { slug: activity.id.toString() }))
			: goto(resolve('/organization/activities')));
	}
</script>

<Card
	titleIconStart={calendarOutline}
	tourId={TourStepId.HOME.UPCOMING_ACTIVITY}
	title={$t('routes.page.page.upcoming-activity-card.card.title')}
	border="secondary"
	clicked={editMode ? undefined : onNavigateActivity}
	titleIconEnd={editMode ? undefined : arrowForwardOutline}
	readonly={editMode}
>
	{#if activity}
		<div class="flex flex-wrap items-center justify-center gap-3">
			<IconLabel icon={flashOutline} label={activity.name} />
			<IconLabel
				icon={calendarClearOutline}
				label={formatDistanceToNow(new TZDate(activity.date), {
					addSuffix: true,
					locale: getDateFnsLocale($localeStore)
				})}
			/>
			<IconLabel
				icon={cashOutline}
				label={$t('routes.page.page.upcoming-activity-card.card.activity-postings', {
					value: activity.activityPostings.length
				})}
			/>
		</div>
	{:else}
		<ion-note class="block text-center text-sm whitespace-pre-wrap italic">
			{$t('routes.page.page.upcoming-activity-card.card.no-upcoming-activity')}
		</ion-note>
	{/if}
</Card>
