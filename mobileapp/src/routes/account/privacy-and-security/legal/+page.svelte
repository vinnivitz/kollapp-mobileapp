<script>
	import Layout from '$lib/components/layout/Layout.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import { t } from '$lib/locales';
</script>

<Layout title={$t('routes.account.page.privacy-and-security.page.legal.title')} showBackButton>
	<Card title={$t('routes.account.page.privacy-and-security.page.legal.list.disclaimer.title')}>
		<h2 class="pb-1">
			{$t('routes.account.page.privacy-and-security.page.legal.list.disclaimer.content.content.title')}
		</h2>
		<p>
			{$t('routes.account.page.privacy-and-security.page.legal.list.disclaimer.content.content.content')}
		</p>

		<h2 class="pt-4 pb-1">
			{$t('routes.account.page.privacy-and-security.page.legal.list.disclaimer.content.links.title')}
		</h2>
		<p>
			{$t('routes.account.page.privacy-and-security.page.legal.list.disclaimer.content.links.content')}
		</p>
		<h2 class="pt-4 pb-1">
			{$t('routes.account.page.privacy-and-security.page.legal.list.disclaimer.content.copyright.title')}
		</h2>
		<p>
			{$t('routes.account.page.privacy-and-security.page.legal.list.disclaimer.content.copyright.content')}
		</p>
	</Card>
	<Card title={$t('routes.account.page.privacy-and-security.page.legal.list.privacy.title')}>
		<p>
			{$t('routes.account.page.privacy-and-security.page.legal.list.privacy.content')}
		</p>
	</Card>
</Layout>
