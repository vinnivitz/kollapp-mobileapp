<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Landing from '$lib/pages/Landing.svelte';
</script>

<!-- <header class="absolute left-0 top-0 w-full">
	<Header></Header>
</header> -->

<main class="h-screen w-full">
	<section class="bg-slanted h-screen w-full">
		<Landing></Landing>
	</section>
</main>

<footer class="absolute bottom-6 w-full md:bottom-10">
	<Footer></Footer>
</footer>
