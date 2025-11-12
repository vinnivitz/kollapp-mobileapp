<script lang="ts">
	import { addOutline, attachOutline, documentOutline, personOutline } from 'ionicons/icons';

	import LayoutComponent from '$lib/components/layout/Layout.svelte';
	import AmountInputItem from '$lib/components/widgets/ionic/AmountInputItem.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import Calendar from '$lib/components/widgets/ionic/Datetime.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import LabeledItem from '$lib/components/widgets/ionic/LabeledItem.svelte';
	import LocationInputItem from '$lib/components/widgets/ionic/LocationInputItem.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import TextareaInputItem from '$lib/components/widgets/ionic/TextareaInputItem.svelte';
	import TextInputItem from '$lib/components/widgets/ionic/TextInputItem.svelte';
	import ToggleItem from '$lib/components/widgets/ionic/ToggleItem.svelte';
	import LeafletMap from '$lib/components/widgets/LeafletMap.svelte';
	import { Locale } from '$lib/locales';
	import { AlertType, Layout, Theme } from '$lib/models/ui';
	import { layoutStore, localeStore, themeStore } from '$lib/stores';
	import { showAlert } from '$lib/utility';

	let modalOpen = $state(false);
	let popoverOpened = $state(false);

	function onFilter(event: CustomEvent): void {
		const value = event.detail.value as string;

		const cards = document.querySelectorAll('ion-card');

		for (const card of cards) {
			const cardTitle = card.querySelector('ion-card-title');
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
	<ion-searchbar onionInput={onFilter} color="light"></ion-searchbar>
	<div class="mx-2 flex gap-2 truncate">
		<ion-select
			aria-label="Layout"
			interface="popover"
			value={$layoutStore}
			onionChange={onLayoutChange}
			fill="outline"
		>
			<ion-select-option value={Layout.MD}>Android</ion-select-option>
			<ion-select-option value={Layout.IOS}>iOS</ion-select-option>
		</ion-select>
		<ion-select
			aria-label="Language"
			interface="popover"
			value={$localeStore}
			onionChange={onLocaleChange}
			fill="outline"
		>
			<ion-select-option value={Locale.DE}>German</ion-select-option>
			<ion-select-option value={Locale.EN}>English</ion-select-option>
		</ion-select>
		<ion-select aria-label="Theme" interface="popover" value={$themeStore} onionChange={onThemeChange} fill="outline">
			<ion-select-option value={Theme.LIGHT}>Light</ion-select-option>
			<ion-select-option value={Theme.DARK}>Dark</ion-select-option>
			<ion-select-option value={Theme.BLACK_AND_WHITE}>Black and white</ion-select-option>
		</ion-select>
	</div>
	<Card title="Buttons">
		<Modal
			open={modalOpen}
			dismissed={async () => {
				modalOpen = false;
				await showAlert('Modal dismissed');
			}}
			confirmed={async () => await showAlert('Model confirmed', { type: AlertType.SUCCESS })}
			lazy
		>
			<ion-text>This is a modal.</ion-text>
		</Modal>
		<div class="flex flex-wrap items-center justify-center">
			<Button
				label="Default"
				icon={addOutline}
				clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			/>
			<Button
				label="Outline"
				fill="outline"
				icon={addOutline}
				clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Clear"
				fill="clear"
				icon={addOutline}
				clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button icon={addOutline} clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Disabled"
				disabled
				icon={addOutline}
				clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Icon right"
				iconPosition="end"
				icon={addOutline}
				clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Icon big"
				iconSize="large"
				icon={addOutline}
				clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
			<Button
				label="Button large"
				size="large"
				icon={addOutline}
				clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })}
			></Button>
		</div>
	</Card>
	<Card title="Toggle">
		<ToggleItem
			card
			icon={personOutline}
			label="Toggle item with icon"
			change={async (value) => await showAlert('Toggle changed: ' + value, { type: AlertType.SUCCESS })}
		/>
		<ToggleItem
			card
			label="Toggle item"
			change={async (value) => await showAlert('Toggle changed: ' + value, { type: AlertType.SUCCESS })}
		/>
	</Card>
	<Card title="Chips">
		<Chip label="Chip label" />
		<Chip label="Clickable chip" clicked={async () => await showAlert('Chip clicked', { type: AlertType.SUCCESS })} />
		<Chip label="Chip with icon" icon={personOutline} />
		<Chip label="Chip with end icon" iconEnd={personOutline} />
	</Card>
	<Card title="Fabbutton">
		<div class="relative h-24">
			<FabButton
				horizontal="center"
				icon={addOutline}
				label="Add"
				buttons={[
					{
						handler: async () => await showAlert('Add clicked', { type: AlertType.SUCCESS }),
						icon: addOutline,
						label: 'Add'
					}
				]}
			/>
		</div>
	</Card>
	<Card title="Popover" classList="text-center">
		<Button label="Open popover" clicked={() => (popoverOpened = true)} />
		<Popover open={popoverOpened} dismissed={() => (popoverOpened = false)}>
			<div class="p-5">This is a popover.</div>
		</Popover>
	</Card>
	<Card title="Calendar">
		<div class="flex flex-col gap-4">
			<Calendar applied={async () => await showAlert('Date selected', { type: AlertType.SUCCESS })} />
			<Calendar showTitle={false} showButtons={false} />
		</div>
	</Card>
	<Card title="Items">
		<CustomItem card>
			<div class="flex w-full items-center justify-between gap-4">
				<ion-label>Custom item</ion-label>
				<Button clicked={async () => await showAlert('Button clicked', { type: AlertType.SUCCESS })} label="Click me"
				></Button>
			</div>
		</CustomItem>
		<LabeledItem card label="Labeled item"></LabeledItem>
		<LabeledItem card transparent label="Transparent labeled item"></LabeledItem>
		<LabeledItem
			card
			label="Clickable labeled item"
			clicked={async () => await showAlert('Item clicked', { type: AlertType.SUCCESS })}
		></LabeledItem>
		<LabeledItem card label="Labeled item with icon" icon={documentOutline}></LabeledItem>
		<TextInputItem card label="Input item" name="value"></TextInputItem>
		<TextInputItem card label="Input item" name="value" helperText="With helper text"></TextInputItem>
		<TextInputItem card label="Input item with icon" name="value" icon={personOutline}></TextInputItem>
		<TextInputItem
			card
			label="Input item with clickable icon"
			name="value"
			inputIcon={attachOutline}
			inputIconClicked={async () => await showAlert('Item clicked', { type: AlertType.SUCCESS })}
		></TextInputItem>
	</Card>
	<Card title="Custom Input Items">
		<AmountInputItem
			card
			label="Amount input item"
			name="amount"
			helperText="Use this in forms with formatter and parser"
		/>
		<TextareaInputItem icon={attachOutline} card label="Textarea item" name="textarea" />
		<LocationInputItem
			card
			label="Location input item"
			name="location"
			helperText="Map not shown cos there is already an instance"
		/>
		<DatetimeInputItem card label="Datetime input item" name="datetime" />
	</Card>
	<Card title="Modal">
		<div class="text-center">
			<Button label="Open modal" clicked={() => (modalOpen = true)}></Button>
		</div>
	</Card>
	<Card title="Map">
		<LeafletMap classList="h-[70vh]"></LeafletMap>
	</Card>
</LayoutComponent>
