<script lang="ts">
	import Datetime from './Datetime.svelte';

	import { globalPopoverStore } from '$lib/stores';

	const { datetimeInputItem } = globalPopoverStore;
</script>

<!-- DatetimeInputItem popover for calendar selection -->

<!-- svelte-ignore event_directive_deprecated -->
<ion-popover
	class="extended"
	is-open={$datetimeInputItem.open}
	on:didDismiss={() => datetimeInputItem.update((item) => ({ ...item, open: false }))}
>
	{#if $datetimeInputItem.open}
		<div class="text-center">
			<Datetime
				value={$datetimeInputItem.value}
				applied={$datetimeInputItem.applied}
				dismissed={$datetimeInputItem.dismissed}
				type={$datetimeInputItem.type}
				min={$datetimeInputItem.min}
				max={$datetimeInputItem.max}
			/>
		</div>
	{/if}
</ion-popover>
