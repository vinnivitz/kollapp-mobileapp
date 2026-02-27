<script lang="ts">
	import Popover from './Popover.svelte';

	import { Datetime } from '$lib/components/shared';
	import { globalPopoverStore } from '$lib/stores';

	const { datetimeInputItem } = globalPopoverStore;
</script>

<!-- DatetimeInputItem popover for calendar selection -->
<Popover
	open={$datetimeInputItem.open}
	extended
	dismissed={() => {
		datetimeInputItem.update((item) => ({ ...item, open: false }));
		$datetimeInputItem.dismissed?.();
	}}
>
	<div class="text-center">
		<Datetime
			value={$datetimeInputItem.value}
			applied={$datetimeInputItem.applied}
			type={$datetimeInputItem.type}
			min={$datetimeInputItem.min}
			max={$datetimeInputItem.max}
		/>
	</div>
</Popover>
