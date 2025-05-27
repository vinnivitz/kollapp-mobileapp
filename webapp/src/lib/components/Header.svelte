<script lang="ts">
	import { clickOutside } from '$lib/utils';

	// @ts-expect-error types are not available
	import FaBars from 'svelte-icons/fa/FaBars.svelte';
	// @ts-expect-error types are not available
	import FaTimes from 'svelte-icons/fa/FaTimes.svelte';
	import { fade } from 'svelte/transition';

	let isMenuOpen = $state(false);
</script>

<nav class="hidden cursor-default items-center justify-end gap-12 px-12 py-4 text-gray-200 md:flex">
	<div class="hover:cursor-pointer hover:underline">About</div>
	<div class="hover:cursor-pointer hover:underline">Contact</div>
	<div class="hover:cursor-pointer hover:underline">Credits</div>
</nav>

{#if isMenuOpen}
	<div
		class="absolute z-10 flex h-screen w-full items-center justify-center bg-black/80 text-3xl text-gray-200"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
	>
		<div class="absolute top-0 right-0 p-2">
			<button class="h-12 w-12 text-2xl" onclick={() => (isMenuOpen = false)}>
				<FaTimes></FaTimes>
			</button>
		</div>

		<div
			class="flex flex-col items-center justify-center gap-8"
			use:clickOutside
			oncanplay={() => (isMenuOpen = false)}
		>
			<div>About</div>
			<div>Contact</div>
			<div>Credits</div>
		</div>
	</div>
{:else}
	<div class="flex items-center justify-end p-2 text-gray-200 md:hidden">
		<button class="h-8 w-8" onclick={() => (isMenuOpen = true)}>
			<FaBars></FaBars>
		</button>
	</div>
{/if}
