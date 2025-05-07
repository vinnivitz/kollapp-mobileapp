<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Smartphone from '$lib/components/Smartphone.svelte';
</script>

<div class="bg-slanted h-screen w-full">
	<div class="absolute top-6 left-1/2 -translate-x-1/2 text-gray-200 [@media(min-height:800px)]:top-1/6">
		<div class="text-[clamp(2rem,22vw,7.2rem)]">Kollapp</div>
		<div class="p-2 text-[clamp(0.8rem,7vw,1.5rem)] break-keep whitespace-nowrap">
			The app for all the<br />collectives out<br />there.
		</div>
	</div>

	<div class="absolute top-1/3 left-9/12 -translate-x-5/6 sm:top-1/4 [@media(max-height:800px)]:top-3/12">
		<Smartphone></Smartphone>
	</div>

	<div class="absolute bottom-6 left-1/2 w-full -translate-x-1/2 md:bottom-10">
		<Footer></Footer>
	</div>
</div>
