<script lang="ts">
	import type { ActivityModel } from '$lib/models/models';

	import { format } from 'date-fns';
	import { calendarOutline, locationOutline } from 'ionicons/icons';

	import Card from '$lib/components/widgets/ionic/Card.svelte';

	type Properties = {
		value: ActivityModel;
		edit?: (value: ActivityModel) => void;
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
				<div>{format(new Date(), 'PPP')}</div>
			</div>
			<div class="flex items-center gap-2">
				<ion-icon icon={locationOutline} class="text-2xl"></ion-icon>
				<div class="max-w-[60vw] truncate">{value.location}</div>
			</div>
		</div>
	</div>
</Card>
