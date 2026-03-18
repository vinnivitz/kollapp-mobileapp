<script lang="ts">
	import type { ApexOptions } from 'apexcharts';

	import Chart from '@edde746/svelte-apexcharts';
	import { onMount } from 'svelte';

	type Properties = {
		options: ApexOptions;
	};

	let { options }: Properties = $props();

	let ready = $state<boolean>(false);

	const height = $derived(
		typeof options.chart?.height === 'number' ? `${options.chart.height}px` : (options.chart?.height ?? '280px')
	);

	onMount(() => {
		const idle =
			typeof requestIdleCallback === 'function'
				? requestIdleCallback(() => (ready = true), { timeout: 200 })
				: setTimeout(() => (ready = true), 50);

		return () => {
			if (typeof cancelIdleCallback === 'function' && typeof idle === 'number') {
				cancelIdleCallback(idle);
			} else {
				clearTimeout(idle);
			}
		};
	});
</script>

{#if ready}
	<div class="animate-chart-in">
		<Chart {options}></Chart>
	</div>
{:else}
	<div class="chart-skeleton" style:height>
		<div class="skeleton-shimmer"></div>
	</div>
{/if}

<style>
	.chart-skeleton {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: var(--ion-color-light);
		overflow: hidden;
		position: relative;
	}

	.skeleton-shimmer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			color-mix(in srgb, var(--ion-color-medium) 8%, transparent) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.animate-chart-in {
		animation: chartFadeIn 200ms ease-out;
	}

	@keyframes chartFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
