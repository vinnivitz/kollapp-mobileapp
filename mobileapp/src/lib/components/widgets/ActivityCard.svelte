<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';

	import { calendarOutline, locationOutline } from 'ionicons/icons';

	import Card from '$lib/components/widgets/Card.svelte';
	import { getDate } from '$lib/utility';

	type Properties = {
		value: ActivityModel;
		edit?: (value: ActivityModel) => Promise<void> | void;
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
				<div>{getDate(new Date())}</div>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={locationOutline} class="text-2xl"></ion-icon>
				<div class="max-w-[60vw] truncate">{value.location}</div>
			</div>
		</div>
	</div>
</Card>
