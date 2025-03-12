<script lang="ts">
	import { calendarOutline, locationOutline } from 'ionicons/icons';
	import moment from 'moment';

	import Card from '$lib/components/widgets/Card.svelte';
	import type { ActivityModel } from '$lib/models/models';

	type Properties = {
		edit?: (value: ActivityModel) => void | Promise<void>;
		value: ActivityModel;
	};

	let { edit, value }: Properties = $props();
</script>

<Card color="light" click={() => edit?.(value)}>
	<div class="flex flex-col justify-center">
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
				<div class="max-w-[60vw] truncate">{value.location}</div>
			</div>
		</div>
	</div>
</Card>
