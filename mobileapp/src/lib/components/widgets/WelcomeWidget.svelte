<script lang="ts">
	import logo from '$lib/assets/logo.png';
	import { t } from '$lib/locales';
</script>

<div class="flex flex-col items-center text-center">
	<ion-img src={logo} class="my-4 h-24 w-24"></ion-img>
	<ion-text color="primary" class="text-3xl">{$t('components.widgets.welcome.heading')}</ion-text>
	<ion-text color="medium">{$t('components.widgets.welcome.subheading')}</ion-text>
</div>
