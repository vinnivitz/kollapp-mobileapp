<script lang="ts">
	import { buildOutline, calendarOutline, locationOutline, trashBinOutline } from 'ionicons/icons';
	import moment from 'moment';

	import Button from './Button.svelte';

	import Card from '$lib/components/widgets/Card.svelte';
	import type { ActivityModel } from '$lib/models/models';

	let {
		value,
		edit,
		remove
	}: {
		value: ActivityModel;
		edit?: (value: ActivityModel) => void | Promise<void>;
		remove?: (id: string) => void | Promise<void>;
	} = $props();
</script>

<Card color="light" click={() => edit?.(value)}>
	<div class="flex items-center justify-between">
		<div class="flex max-w-[60%] flex-1 flex-col justify-center">
			<div class="text-lg">
				{value.name}
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<div class="flex items-center gap-2">
					<ion-icon icon={calendarOutline} class="text-2xl"></ion-icon>
					<div>{moment().format('DD.MM.YYYY')}</div>
				</div>
				<div class="flex items-center gap-2">
					<ion-icon icon={locationOutline} class="text-2xl"></ion-icon>
					<div class="max-w-[60%] truncate">{value.location}</div>
				</div>
			</div>
		</div>
		<div class="flex">
			<Button
				color="primary"
				fill="clear"
				iconSize="large"
				classProp="text-xs"
				icon={buildOutline}
				click={() => edit?.(value)}
			></Button>
			<Button
				color="danger"
				fill="clear"
				iconSize="large"
				classProp="text-xs"
				icon={trashBinOutline}
				click={(event) => {
					event?.stopPropagation();
					remove?.(value.id);
				}}
			></Button>
		</div>
	</div>
</Card>
