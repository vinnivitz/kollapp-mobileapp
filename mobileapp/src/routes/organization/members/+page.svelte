<script lang="ts">
	import { fade } from 'svelte/transition';

	import Layout from '$lib/components/layout/Layout.svelte';
</script>

<Layout title="Manage members" showBackButton>
	<ion-list in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}> </ion-list>
</Layout>
