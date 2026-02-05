<script>
	import { mailOutline, personOutline } from 'ionicons/icons';

	import { Layout } from '$lib/components/layout';
	import { Card, LabeledItem } from '$lib/components/widgets/ionic';
	import { t } from '$lib/locales';
</script>

<Layout title={$t('routes.account.privacy-and-security.legal.page.title')} showBackButton>
	<Card title={$t('routes.account.privacy-and-security.legal.page.card.disclaimer.title')}>
		<h2 class="pb-1">
			{$t('routes.account.privacy-and-security.legal.page.card.disclaimer.liability-for-content.heading')}
		</h2>
		<p>
			{$t('routes.account.privacy-and-security.legal.page.card.disclaimer.liability-for-content.content')}
		</p>

		<h2 class="pt-4 pb-1">
			{$t('routes.account.privacy-and-security.legal.page.card.disclaimer.liability-for-links.heading')}
		</h2>
		<p>
			{$t('routes.account.privacy-and-security.legal.page.card.disclaimer.liability-for-links.content')}
		</p>
		<h2 class="pt-4 pb-1">
			{$t('routes.account.privacy-and-security.legal.page.card.disclaimer.copyright.heading')}
		</h2>
		<p>
			{$t('routes.account.privacy-and-security.legal.page.card.disclaimer.copyright.content')}
		</p>
	</Card>
	<Card title={$t('routes.account.privacy-and-security.legal.page.card.privacy.title')}>
		<p>
			{$t('routes.account.privacy-and-security.legal.page.card.privacy.content')}
		</p>
	</Card>
	<Card title={$t('routes.account.privacy-and-security.legal.page.card.credits.title')}>
		<LabeledItem icon={personOutline} label="Vinzenz Fuhrmann" />
		<LabeledItem icon={mailOutline} label="mail@kollapp.org" />
	</Card>
</Layout>
