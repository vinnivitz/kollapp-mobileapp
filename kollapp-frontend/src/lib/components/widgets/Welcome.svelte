<script>
	import { t } from '$lib/locales';
</script>

<div class="flex flex-col items-center">
	<ion-img src="/logo.png" class="my-4 h-24 w-24"></ion-img>
	<ion-text color="primary" class="text-3xl">{$t('routes.auth.login.card.welcome.title')}</ion-text>
	<ion-note>{$t('routes.auth.login.card.welcome.content')}</ion-note>
</div>
