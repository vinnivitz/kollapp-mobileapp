<script>
	import { archive, star, trash } from 'ionicons/icons';

	import IonLayout from '$lib/components/ion/IonLayout.svelte';
	import { PageRoute } from '$lib/models';

	const events = [{ name: 'Event 1' }, { name: 'Event 2' }, { name: 'Event 3' }];
</script>

<IonLayout tab={PageRoute.FINANCES} title="Oragaapp">
	<h1>The finances</h1>
	<ion-list>
		{#each events as event_}
			<ion-item-sliding>
				<ion-item-options side="start">
					<ion-item-option color="success">
						<div class="flex items-center justify-center gap-2">
							<ion-icon icon={archive}></ion-icon>
							<div>Archive</div>
						</div>
					</ion-item-option>
				</ion-item-options>
				<ion-item>
					<ion-label>{event_.name}</ion-label>
				</ion-item>
				<ion-item-options>
					<ion-item-option>
						<div class="flex items-center justify-center gap-2">
							<ion-icon icon={star}></ion-icon>
							<div>Favourites</div>
						</div>
					</ion-item-option>
					<ion-item-option color="danger"
						><div class="flex items-center justify-center gap-2">
							<ion-icon icon={trash}></ion-icon>
							<div>Delete</div>
						</div>
					</ion-item-option>
				</ion-item-options>
			</ion-item-sliding>
		{/each}
	</ion-list>
</IonLayout>
