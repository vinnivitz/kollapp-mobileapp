<script lang="ts">
	import { CustomItem } from '$lib/components/core';
	import { formatter } from '$lib/utility';

	type Properties = {
		credit: number;
		debit: number;
		label: string;
		total: number;
		note?: string;
	};

	let { credit, debit, label, note, total }: Properties = $props();
</script>

<CustomItem>
	<div class="flex w-full flex-row items-center justify-between gap-2">
		<div class="flex min-w-0 flex-1 flex-col">
			<ion-text class="block truncate">{label}</ion-text>
			<div class="flex gap-3 text-xs">
				<ion-text color="success">+{formatter.currency(credit)}</ion-text>
				<ion-text color="danger">-{formatter.currency(debit)}</ion-text>
			</div>
		</div>
		<div class="flex flex-col items-end">
			<ion-text class="font-bold" color={total >= 0 ? 'success' : 'danger'}>
				{formatter.currency(total)}
			</ion-text>
			{#if note}
				<ion-note class="text-xs">
					{note}
				</ion-note>
			{/if}
		</div>
	</div>
</CustomItem>
