<script lang="ts">
	import { Layout } from '$lib/components/layout';
	import { PageNotFoundWidget } from '$lib/components/widgets';
	import { t } from '$lib/locales';
</script>

<Layout title={$t('routes.error.page.title')}>
	<PageNotFoundWidget></PageNotFoundWidget>
</Layout>
