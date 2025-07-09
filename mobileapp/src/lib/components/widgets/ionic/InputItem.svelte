<script lang="ts">
	import type { Colors } from '$lib/models/ui';
	import type { Snippet } from 'svelte';

	import CustomItem from './CustomItem.svelte';

	type Properties = {
		children: Snippet;
		icon: string;
		label: string;
		classList?: string;
		color?: Colors;
		disabled?: boolean;
		name?: string;
		clicked: () => void;
	};

	let { children, classList, clicked, color, disabled, icon, label }: Properties = $props();
</script>

<CustomItem {icon} {clicked} {classList} {color} {disabled}>
	<div class="flex flex-col">
		<ion-text class="ms-3 pt-2 text-xs">
			{label}
		</ion-text>
		<div class="my-2 ms-4">
			{@render children()}
		</div>
	</div>
</CustomItem>
