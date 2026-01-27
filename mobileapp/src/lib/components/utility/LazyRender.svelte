<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	type Properties = {
		children: Snippet;
		/** Once visible, keep rendered even when scrolled away */
		keepRendered?: boolean;
		/** Placeholder height to prevent layout shift */
		minHeight?: string;
		/** Root margin for intersection observer (e.g., "100px" to load earlier) */
		rootMargin?: string;
		/** Threshold for intersection (0-1) */
		threshold?: number;
	};

	let { children, keepRendered = true, minHeight = '100px', rootMargin = '50px', threshold = 0 }: Properties = $props();

	let container = $state<HTMLDivElement>();
	let isVisible = $state<boolean | undefined>(false);
	let wasVisible = $state<boolean>(false);

	const shouldRender = $derived(keepRendered ? wasVisible : isVisible);

	onMount(() => {
		if (!container) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				isVisible = entry?.isIntersecting;
				if (entry?.isIntersecting) {
					wasVisible = true;
				}
			},
			{
				rootMargin,
				threshold
			}
		);

		observer.observe(container);

		return () => observer.disconnect();
	});
</script>

<div bind:this={container} style:min-height={shouldRender ? 'auto' : minHeight}>
	{#if shouldRender}
		{@render children()}
	{/if}
</div>
