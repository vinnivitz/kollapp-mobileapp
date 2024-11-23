<script>
	import IonCard from '$lib/components/ion/IonCard.svelte';
	import IonLayout from '$lib/components/ion/IonLayout.svelte';
	import { PageRoute } from '$lib/models';
	import * as m from '$lib/paraglide/messages';
</script>

<IonLayout tab={PageRoute.HOME} title="Oragaapp">
	<IonCard title={m.fuzzy_spry_firefox_sail()}>This is an overview page.</IonCard>
</IonLayout>
