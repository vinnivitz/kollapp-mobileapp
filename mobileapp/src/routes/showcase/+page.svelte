<script lang="ts">
	import { addOutline, attachOutline, documentOutline, personOutline } from 'ionicons/icons';

	import LayoutComponent from '$lib/components/layout/Layout.svelte';
	import ActivityCard from '$lib/components/widgets/ActivityCard.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import Calendar from '$lib/components/widgets/ionic/Datetime.svelte';
	import InputItem from '$lib/components/widgets/ionic/InputItem.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import LeafletMap from '$lib/components/widgets/LeafletMap.svelte';
	import { Locale } from '$lib/locales';
	import { AlertType, Layout, Theme } from '$lib/models/ui';
	import { layoutStore, localeStore, themeStore } from '$lib/stores';
	import { showAlert } from '$lib/utility';

	let modalOpen = $state(false);

	function onFilter(event: CustomEvent): void {
		const value = event.detail.value as string;

		const cards = document.querySelectorAll('ion-card') as NodeListOf<HTMLIonCardElement>;

		for (const card of cards) {
			const cardTitle = card.querySelector('ion-card-title') as HTMLIonCardTitleElement;
			card.style.display =
				!cardTitle || cardTitle?.textContent?.toLowerCase().includes(value.toLowerCase()) ? 'block' : 'none';
		}
	}

	function onThemeChange(event: CustomEvent): void {
		themeStore.set(event.detail.value);
	}

	function onLayoutChange(event: CustomEvent): void {
		layoutStore.set(event.detail.value);
	}

	function onLocaleChange(event: CustomEvent): void {
		localeStore.set(event.detail.value);
	}
</script>

<LayoutComponent title="Showcase">
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-searchbar on:ionInput={onFilter} color="light"></ion-searchbar>
	<div class="mx-2 flex gap-2 truncate">
		<ion-select
			aria-label="Layout"
			interface="popover"
			value={$layoutStore}
			on:ionChange={onLayoutChange}
			fill="outline"
		>
			<ion-select-option value={Layout.MD}>Android</ion-select-option>
			<ion-select-option value={Layout.IOS}>iOS</ion-select-option>
		</ion-select>
		<ion-select
			aria-label="Language"
			interface="popover"
			value={$localeStore}
			on:ionChange={onLocaleChange}
			fill="outline"
		>
			<ion-select-option value={Locale.DE}>German</ion-select-option>
			<ion-select-option value={Locale.EN}>English</ion-select-option>
		</ion-select>
		<ion-select aria-label="Theme" interface="popover" value={$themeStore} on:ionChange={onThemeChange} fill="outline">
			<ion-select-option value={Theme.LIGHT}>Light</ion-select-option>
			<ion-select-option value={Theme.DARK}>Dark</ion-select-option>
			<ion-select-option value={Theme.BLACK_AND_WHITE}>Black and white</ion-select-option>
		</ion-select>
	</div>
	<Card title="Buttons">
		<Modal
			dismissed={() => (modalOpen = false)}
			open={modalOpen}
			cancel={() => {
				modalOpen = false;
				showAlert('Modal canceled');
			}}
			confirm={() => {
				modalOpen = false;
				showAlert('Model confirmed', { type: AlertType.SUCCESS });
			}}
		>
			This is a modal.
		</Modal>
		<div class="flex flex-wrap items-center justify-center">
			<Button label="Default" icon={addOutline} click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Outline"
				fill="outline"
				icon={addOutline}
				click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Clear"
				fill="clear"
				icon={addOutline}
				click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button icon={addOutline} click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}></Button>
			<Button
				label="Disabled"
				disabled
				icon={addOutline}
				click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Icon right"
				iconPosition="end"
				icon={addOutline}
				click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Icon big"
				iconSize="large"
				icon={addOutline}
				click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Button large"
				size="large"
				icon={addOutline}
				click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
		</div>
	</Card>
	<Card title="Calendar">
		<div class="flex flex-col gap-4">
			<Calendar apply={() => showAlert('Date selected', { type: AlertType.SUCCESS })}></Calendar>
			<Calendar showTitle={false}></Calendar>
		</div>
	</Card>
	<Card title="Activity card" classList="bg-transparent">
		<ActivityCard value={{ id: 1, location: 'Activity location', name: 'Activity name' }}></ActivityCard>
	</Card>
	<Card title="Items">
		<CustomItem card>
			<div class="flex w-full items-center justify-between gap-4">
				<ion-label>Custom item</ion-label>
				<Button click={() => showAlert('Button clicked', { type: AlertType.SUCCESS })} label="Click me"></Button>
			</div>
		</CustomItem>
		<LabeledItem card label="Labeled item"></LabeledItem>
		<LabeledItem card transparent label="Transparent labeled item"></LabeledItem>
		<LabeledItem
			card
			label="Clickable labeled item"
			click={() => showAlert('Item clicked', { type: AlertType.SUCCESS })}
		></LabeledItem>
		<LabeledItem card label="Labeled item with icon" icon={documentOutline}></LabeledItem>
		<InputItem card label="Input item" name="value"></InputItem>
		<InputItem card label="Input item" name="value" helperText="With helper text"></InputItem>
		<InputItem card label="Input item with icon" name="value" icon={personOutline}></InputItem>
		<InputItem
			card
			label="Input item with clickable icon"
			name="value"
			inputIcon={attachOutline}
			inputIconClick={() => showAlert('Item clicked', { type: AlertType.SUCCESS })}
		></InputItem>
	</Card>
	<Card title="Modal">
		<div class="text-center">
			<Button label="Open modal" click={() => (modalOpen = true)}></Button>
		</div>
	</Card>
	<Card title="Map">
		<LeafletMap classList="h-[70vh]"></LeafletMap>
	</Card>
</LayoutComponent>
