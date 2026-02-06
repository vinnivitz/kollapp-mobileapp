<script lang="ts">
	import { Layout } from '$lib/components/layout';
	import { NotFound } from '$lib/components/shared';
	import { t } from '$lib/locales';
</script>

<Layout title={$t('routes.error.page.title')}>
	<NotFound></NotFound>
</Layout>
