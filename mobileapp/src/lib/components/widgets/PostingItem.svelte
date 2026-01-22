<script lang="ts">
	import type { ItemSlidingOption } from '$lib/models/ui';
	import type { PostingTO } from '@kollapp/api-types';

	import { TZDate } from '@date-fns/tz';
	import { format } from 'date-fns';
	import {
		calendarClearOutline,
		cardOutline,
		flashOutline,
		personOutline,
		trendingDownOutline,
		trendingUpOutline
	} from 'ionicons/icons';

	import CustomItem from './ionic/CustomItem.svelte';

	import { formatter } from '$lib/utility';

	type Properties = {
		budgetCategoryName: string;
		posting: PostingTO;
		activityName?: string;
		slidingOptions?: ItemSlidingOption[];
		username?: string;
	};

	let { activityName, budgetCategoryName, posting, slidingOptions, username }: Properties = $props();
</script>

<CustomItem
	{slidingOptions}
	iconColor={posting.type === 'CREDIT' ? 'success' : 'danger'}
	icon={posting.type === 'CREDIT' ? trendingUpOutline : trendingDownOutline}
>
	<div class="mt-2 flex w-full flex-col items-center gap-2">
		<div class="flex w-full items-center justify-between">
			<ion-text class="font-semibold">{posting.purpose}</ion-text>
			<ion-text color={posting.type === 'CREDIT' ? 'success' : 'danger'} class="font-bold text-nowrap">
				{posting.type === 'CREDIT' ? '+' : '-'}
				{formatter.currency(posting.amountInCents)}
			</ion-text>
		</div>
		<div class="flex w-full flex-wrap items-center justify-start gap-2">
			<ion-note class="flex items-center justify-center gap-1 text-sm">
				<ion-icon icon={calendarClearOutline}></ion-icon>
				<ion-label>{format(new TZDate(posting.date), 'PP')}</ion-label>
			</ion-note>
			{#if budgetCategoryName}
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={cardOutline}></ion-icon>
					<ion-label class="truncate">{budgetCategoryName}</ion-label>
				</ion-note>
			{/if}
			{#if activityName}
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={flashOutline}></ion-icon>
					<div class="truncate">{activityName}</div>
				</ion-note>
			{/if}
			{#if username}
				<ion-note class="flex items-center justify-center gap-1 text-sm">
					<ion-icon icon={personOutline}></ion-icon>
					<div class="truncate">{username}</div>
				</ion-note>
			{/if}
		</div>
	</div>
</CustomItem>
