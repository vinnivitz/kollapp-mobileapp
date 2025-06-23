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
	<Card title="Credits">
		<div>
			<ion-text>Max Mustermann</ion-text><br />
			<ion-text>MusterApp UG (haftungsbeschränkt)</ion-text><br />
			<ion-text>Musterstraße 12</ion-text><br />
			<ion-text>12345 Musterstadt</ion-text><br />
			<ion-text>Deutschland</ion-text>
		</div>

		<div class="mt-2">
			<ion-text>Vertreten durch: Max Mustermann</ion-text>
		</div>

		<div class="mt-2">
			<ion-text>Kontakt:</ion-text><br />
			<ion-text>Telefon: +49 (0)123 4567890</ion-text><br />
			<a href="mailto:kontakt@musterapp.de">kontakt@musterapp.de</a>
		</div>

		<div class="mt-2">
			<ion-text>Registereintrag:</ion-text><br />
			<ion-text>Eintragung im Handelsregister</ion-text><br />
			<ion-text>Registergericht: Amtsgericht Musterstadt</ion-text><br />
			<ion-text>Registernummer: HRB 123456</ion-text>
		</div>

		<div class="mt-2">
			<ion-text>Umsatzsteuer-ID:</ion-text><br />
			<ion-text>Umsatzsteuer-Identifikationsnummer gemäß §27a UStG: DE123456789</ion-text>
		</div>

		<div class="mt-2">
			<ion-text>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</ion-text><br />
			<ion-text>Max Mustermann</ion-text><br />
			<ion-text>Musterstraße 12</ion-text><br />
			<ion-text>12345 Musterstadt</ion-text>
		</div>

		<div class="mt-2">
			<ion-text> Plattform der EU-Kommission zur Online-Streitbeilegung: </ion-text><br />
			<a href="https://ec.europa.eu/consumers/odr/" target="_blank">https://ec.europa.eu/consumers/odr/</a>
		</div>

		<div class="mt-2">
			<ion-text> Hinweis nach Verbraucherstreitbeilegungsgesetz (§ 36 VSBG): </ion-text><br />
			<ion-text>
				Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
				Verbraucherschlichtungsstelle teilzunehmen.
			</ion-text>
		</div>
	</Card>
</Layout>
