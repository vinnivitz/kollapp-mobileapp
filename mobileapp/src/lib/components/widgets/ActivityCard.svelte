<script lang="ts">
	import { calendarOutline, locationOutline } from 'ionicons/icons';
	import moment from 'moment';

	import Card from '$lib/components/widgets/Card.svelte';
	import type { ActivityModel } from '$lib/models/models';

	let { activity, click }: { activity: ActivityModel; click?: () => void | Promise<void> } = $props();
</script>

<Card color="light" click={() => click?.()}>
	<div class="flex">
		<div class="flex flex-col justify-center">
			<div class="text-lg">
				{activity.name}
			</div>
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<ion-icon icon={calendarOutline} class="text-2xl"></ion-icon>
					<div>{moment().format('DD.MM.YYYY')}</div>
				</div>
				<div class="flex items-center gap-2">
					<ion-icon icon={locationOutline} class="text-2xl"></ion-icon>
					<div>{activity.location}</div>
				</div>
			</div>
		</div>
	</div>
</Card>
