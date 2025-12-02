<script lang="ts">
	import Layout from '$lib/components/layout/Layout.svelte';
	import PageNotFound from '$lib/components/widgets/PageNotFound.svelte';
	import { t } from '$lib/locales';
</script>

<Layout title={$t('routes.error.page.title')}>
	<PageNotFound></PageNotFound>
</Layout>
