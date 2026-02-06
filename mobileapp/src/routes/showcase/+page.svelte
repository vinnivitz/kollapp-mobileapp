<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import {
		addOutline,
		albumsOutline,
		arrowForwardOutline,
		attachOutline,
		banOutline,
		calendarClearOutline,
		checkboxOutline,
		chevronExpandOutline,
		colorPaletteOutline,
		createOutline,
		documentOutline,
		ellipsisHorizontalOutline,
		expandOutline,
		eyeOffOutline,
		gridOutline,
		handLeftOutline,
		helpCircleOutline,
		imageOutline,
		informationOutline,
		layersOutline,
		listOutline,
		lockClosedOutline,
		mapOutline,
		optionsOutline,
		personOutline,
		resizeOutline,
		searchOutline,
		textOutline,
		timeOutline
	} from 'ionicons/icons';

	import {
		AmountInputItem,
		Button,
		Card,
		Chip,
		CustomItem,
		DatetimeInputItem,
		FabButton,
		IconLabel,
		InputItem,
		LabeledItem,
		LocationInputItem,
		Modal,
		MultiSelectInputItem,
		Popover,
		SegmentItem,
		TextareaInputItem,
		ToggleItem
	} from '$lib/components/core';
	import { Layout as LayoutComponent } from '$lib/components/layout';
	import { Datetime, FilterPanel, MapView } from '$lib/components/shared';
	import { Locale } from '$lib/locales';
	import {
		AlertType,
		chipSection,
		type Colors,
		DateTimePickerType,
		type FilterConfig,
		type FilterSection,
		Layout,
		type MultiSelectItem,
		multiSelectSection,
		type SegmentConfig,
		toggleSection
	} from '$lib/models/ui';
	import { Theme } from '$lib/models/ui';
	import { layoutStore, localeStore, themeStore } from '$lib/stores';
	import { informationModal, showAlert } from '$lib/utility';

	type ShowcaseKey =
		| 'AmountInputItem'
		| 'Button'
		| 'Card'
		| 'Chip'
		| 'CustomItem'
		| 'Datetime'
		| 'DatetimeInputItem'
		| 'FabButton'
		| 'IconLabel'
		| 'InputItem'
		| 'LabeledItem'
		| 'LocationInputItem'
		| 'MapWidget'
		| 'Modal'
		| 'MultiSelectInputItem'
		| 'Popover'
		| 'SegmentItem'
		| 'TextareaInputItem'
		| 'ToggleItem';

	const COLOR_PALETTE: Colors[] = [
		'transparent',
		'primary',
		'secondary',
		'tertiary',
		'success',
		'warning',
		'danger',
		'light',
		'medium',
		'dark'
	];

	const COLOR_ITEMS: MultiSelectItem[] = [
		{ data: { id: 0, label: '(default)' }, selected: true },
		...COLOR_PALETTE.filter((c) => c !== 'transparent').map((c, index) => ({
			color: c,
			data: { id: index + 1, label: c }
		}))
	];

	function toColor(id: number | undefined): Colors | undefined {
		if (!id || id === 0) return undefined;
		const color = COLOR_ITEMS.find((index) => index.data.id === id)?.data.label;
		return color as Colors | undefined;
	}

	function singleId(ids: number[] | undefined): number {
		return ids?.[0] ?? 0;
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

	let query = $state('');
	function onFilterInput(event: CustomEvent): void {
		query = (event.detail.value as string) ?? '';
	}
	const normalizedQuery = $derived(query.trim().toLowerCase());
	function matches(title: string): boolean {
		return normalizedQuery.length === 0 || title.toLowerCase().includes(normalizedQuery);
	}

	const descriptions: Record<ShowcaseKey, string> = {
		AmountInputItem: 'Currency-aware input for amounts (cents) with formatting and parsing.',
		Button: 'App button wrapper around ion-button (icons, fills, sizes).',
		Card: 'Card wrapper around ion-card with header icons and lazy rendering.',
		Chip: 'Selectable/clickable chip with optional icons and color.',
		CustomItem: 'Wrapper around ion-item / sliding item; supports icons, badges and click.',
		Datetime: 'Inline datetime picker with optional title and buttons.',
		DatetimeInputItem: 'Form-like item that opens the global datetime popover.',
		FabButton: 'Floating action button with optional button list.',
		IconLabel: 'Inline icon + label pair with size and color options.',
		InputItem: 'Form-like input item with optional icons and helper text.',
		LabeledItem: 'Clickable labeled list item, optional icon and badge.',
		LocationInputItem: 'Input item that opens a modal map picker.',
		MapWidget: 'Leaflet-based map widget with optional search and selection callback.',
		Modal: 'Ion modal wrapper with confirm/cancel controls and breakpoints.',
		MultiSelectInputItem: 'Multi/single select input that opens a modal selector.',
		Popover: 'Ion popover wrapper; supports extended width and lazy mounting.',
		SegmentItem: 'Sticky segment control rendered using Chips.',
		TextareaInputItem: 'Textarea item with optional placeholder and icons.',
		ToggleItem: 'Toggle item with optional icon.'
	};

	function createDefaultSettings(): Record<ShowcaseKey, Record<string, unknown>> {
		return {
			AmountInputItem: {
				color: [0],
				disabled: false,
				helperText: false,
				hidden: false,
				inputIcon: false,
				readonly: false
			},
			Button: {
				color: [0],
				disabled: false,
				expand: 'unset',
				fill: 'unset',
				icon: true,
				iconEnd: false,
				iconSize: 'unset',
				readonly: false,
				shape: 'unset',
				size: 'unset'
			},
			Card: {
				border: [0],
				color: [0],
				lazy: false,
				readonly: false,
				subtitle: true,
				titleIconEnd: false,
				titleIconStart: false
			},
			Chip: {
				color: [0],
				icon: false,
				iconColor: [0],
				iconEnd: false,
				selected: false
			},
			CustomItem: {
				badge: false,
				color: [0],
				disabled: false,
				hidden: false,
				icon: true,
				iconEnd: false,
				note: false,
				readonly: false,
				transparent: false
			},
			Datetime: {
				highlightDates: false,
				presetValue: false,
				showButtons: true,
				showTitle: true,
				type: DateTimePickerType.DATE
			},
			DatetimeInputItem: {
				hidden: false,
				max: false,
				min: false,
				type: DateTimePickerType.DATE
			},
			FabButton: {
				buttons: true,
				color: [0],
				horizontal: 'end',
				vertical: 'bottom'
			},
			IconLabel: {
				bold: false,
				color: [0],
				iconColor: [0],
				size: 'normal'
			},
			InputItem: {
				color: [0],
				disabled: false,
				helperText: false,
				hidden: false,
				icon: false,
				inputIcon: false,
				readonly: false,
				type: 'unset',
				uppercase: false
			},
			LabeledItem: {
				badge: false,
				color: [0],
				icon: false,
				transparent: false
			},
			LocationInputItem: {
				card: false,
				helperText: true,
				hidden: false
			},
			MapWidget: {
				searchable: true,
				tall: true
			},
			Modal: {
				breakpoints: true,
				informational: false,
				labels: true,
				loading: false,
				title: true,
				touched: true
			},
			MultiSelectInputItem: {
				disabled: false,
				multiple: false,
				readonly: false,
				search: true
			},
			Popover: {
				extended: true,
				lazy: true
			},
			SegmentItem: {
				selected: 'one'
			},
			TextareaInputItem: {
				color: [0],
				disabled: false,
				hidden: false,
				icon: false,
				iconEnd: false,
				maxlength: false,
				placeholder: false,
				readonly: false
			},
			ToggleItem: {
				checked: true,
				disabled: false,
				icon: false
			}
		};
	}

	const DEFAULTS = createDefaultSettings();
	let settings = $state(createDefaultSettings());

	let filterOpen = $state<boolean>(false);
	let activeKey = $state<ShowcaseKey>();

	function openInfoModal(key: ShowcaseKey): void {
		void informationModal(key, descriptions[key]);
	}

	function openFilter(key: ShowcaseKey): void {
		activeKey = key;
		filterOpen = true;
	}
	function dismissFilter(): void {
		filterOpen = false;
	}

	function colorItemsWithDefault(defaultId: number): MultiSelectItem[] {
		return COLOR_ITEMS.map((item) => ({
			...item,
			selected: item.data.id === defaultId
		}));
	}

	function sectionColor(key: string, label: string, defaultId: number): FilterSection {
		return multiSelectSection(key, {
			icon: colorPaletteOutline,
			inputLabel: label,
			items: colorItemsWithDefault(defaultId),
			label,
			multiple: false
		});
	}

	const activeFilterConfig = $derived.by((): FilterConfig<Record<string, unknown>> | undefined => {
		if (!activeKey) return undefined;
		const key = activeKey;
		const state = settings[key];
		const defaults = DEFAULTS[key];

		const sections: FilterSection[] = [];
		switch (key) {
			case 'Button': {
				sections.push(
					toggleSection('disabled', {
						defaultValue: defaults.disabled as boolean,
						icon: banOutline,
						label: 'disabled'
					}),
					toggleSection('readonly', {
						defaultValue: defaults.readonly as boolean,
						icon: lockClosedOutline,
						label: 'readonly'
					}),
					chipSection('fill', {
						defaultValue: defaults.fill as string,
						label: 'fill',
						options: [
							{ label: '(default)', value: 'unset' },
							{ label: 'solid', value: 'solid' },
							{ label: 'outline', value: 'outline' },
							{ label: 'clear', value: 'clear' },
							{ label: 'default', value: 'default' }
						]
					}),
					chipSection('size', {
						defaultValue: defaults.size as string,
						label: 'size',
						options: [
							{ label: '(default)', value: 'unset' },
							{ label: 'small', value: 'small' },
							{ label: 'default', value: 'default' },
							{ label: 'large', value: 'large' }
						]
					}),
					chipSection('shape', {
						defaultValue: defaults.shape as string,
						label: 'shape',
						options: [
							{ label: '(default)', value: 'unset' },
							{ label: 'round', value: 'round' },
							{ label: 'square', value: 'square' }
						]
					}),
					chipSection('expand', {
						defaultValue: defaults.expand as string,
						label: 'expand',
						options: [
							{ label: '(default)', value: 'unset' },
							{ label: 'block', value: 'block' },
							{ label: 'full', value: 'full' }
						]
					}),
					toggleSection('icon', { defaultValue: defaults.icon as boolean, icon: imageOutline, label: 'icon' }),
					toggleSection('iconEnd', {
						defaultValue: defaults.iconEnd as boolean,
						icon: arrowForwardOutline,
						label: 'iconEnd'
					}),
					chipSection('iconSize', {
						defaultValue: defaults.iconSize as string,
						label: 'iconSize',
						options: [
							{ label: '(default)', value: 'unset' },
							{ label: 'small', value: 'small' },
							{ label: 'large', value: 'large' }
						]
					}),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
			case 'Chip': {
				sections.push(
					toggleSection('selected', {
						defaultValue: defaults.selected as boolean,
						icon: checkboxOutline,
						label: 'selected'
					}),
					toggleSection('icon', { defaultValue: defaults.icon as boolean, icon: imageOutline, label: 'icon' }),
					toggleSection('iconEnd', {
						defaultValue: defaults.iconEnd as boolean,
						icon: arrowForwardOutline,
						label: 'iconEnd'
					}),
					sectionColor('color', 'color', singleId(defaults.color as number[])),
					sectionColor('iconColor', 'iconColor', singleId(defaults.iconColor as number[]))
				);
				break;
			}
			case 'ToggleItem': {
				sections.push(
					toggleSection('checked', {
						defaultValue: defaults.checked as boolean,
						icon: checkboxOutline,
						label: 'checked'
					}),
					toggleSection('disabled', {
						defaultValue: defaults.disabled as boolean,
						icon: banOutline,
						label: 'disabled'
					}),
					toggleSection('icon', { defaultValue: defaults.icon as boolean, icon: imageOutline, label: 'icon' })
				);
				break;
			}
			case 'InputItem': {
				sections.push(
					toggleSection('disabled', {
						defaultValue: defaults.disabled as boolean,
						icon: banOutline,
						label: 'disabled'
					}),
					toggleSection('readonly', {
						defaultValue: defaults.readonly as boolean,
						icon: lockClosedOutline,
						label: 'readonly'
					}),
					toggleSection('hidden', { defaultValue: defaults.hidden as boolean, icon: eyeOffOutline, label: 'hidden' }),
					toggleSection('uppercase', {
						defaultValue: defaults.uppercase as boolean,
						icon: textOutline,
						label: 'uppercase'
					}),
					chipSection('type', {
						defaultValue: defaults.type as string,
						label: 'type',
						options: [
							{ label: '(default)', value: 'unset' },
							{ label: 'text', value: 'text' },
							{ label: 'email', value: 'email' },
							{ label: 'number', value: 'number' },
							{ label: 'password', value: 'password' },
							{ label: 'date', value: 'date' }
						]
					}),
					toggleSection('helperText', {
						defaultValue: defaults.helperText as boolean,
						icon: helpCircleOutline,
						label: 'helperText'
					}),
					toggleSection('icon', { defaultValue: defaults.icon as boolean, icon: imageOutline, label: 'icon' }),
					toggleSection('inputIcon', {
						defaultValue: defaults.inputIcon as boolean,
						icon: imageOutline,
						label: 'inputIcon'
					}),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
			case 'TextareaInputItem': {
				sections.push(
					toggleSection('disabled', {
						defaultValue: defaults.disabled as boolean,
						icon: banOutline,
						label: 'disabled'
					}),
					toggleSection('readonly', {
						defaultValue: defaults.readonly as boolean,
						icon: lockClosedOutline,
						label: 'readonly'
					}),
					toggleSection('hidden', { defaultValue: defaults.hidden as boolean, icon: eyeOffOutline, label: 'hidden' }),
					toggleSection('placeholder', {
						defaultValue: defaults.placeholder as boolean,
						icon: textOutline,
						label: 'placeholder'
					}),
					toggleSection('maxlength', {
						defaultValue: defaults.maxlength as boolean,
						icon: createOutline,
						label: 'maxlength'
					}),
					toggleSection('icon', { defaultValue: defaults.icon as boolean, icon: imageOutline, label: 'icon' }),
					toggleSection('iconEnd', {
						defaultValue: defaults.iconEnd as boolean,
						icon: arrowForwardOutline,
						label: 'iconEnd'
					}),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
			case 'AmountInputItem': {
				sections.push(
					toggleSection('disabled', {
						defaultValue: defaults.disabled as boolean,
						icon: banOutline,
						label: 'disabled'
					}),
					toggleSection('readonly', {
						defaultValue: defaults.readonly as boolean,
						icon: lockClosedOutline,
						label: 'readonly'
					}),
					toggleSection('hidden', { defaultValue: defaults.hidden as boolean, icon: eyeOffOutline, label: 'hidden' }),
					toggleSection('helperText', {
						defaultValue: defaults.helperText as boolean,
						icon: helpCircleOutline,
						label: 'helperText'
					}),
					toggleSection('inputIcon', {
						defaultValue: defaults.inputIcon as boolean,
						icon: imageOutline,
						label: 'inputIcon'
					}),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
			case 'Datetime': {
				sections.push(
					toggleSection('showButtons', {
						defaultValue: defaults.showButtons as boolean,
						icon: ellipsisHorizontalOutline,
						label: 'showButtons'
					}),
					toggleSection('showTitle', {
						defaultValue: defaults.showTitle as boolean,
						icon: textOutline,
						label: 'showTitle'
					}),
					chipSection('type', {
						defaultValue: defaults.type as string,
						label: 'type',
						options: [
							{ label: 'date', value: DateTimePickerType.DATE },
							{ label: 'date-time', value: DateTimePickerType.DATETIME },
							{ label: 'time', value: DateTimePickerType.TIME }
						]
					}),
					toggleSection('highlightDates', {
						defaultValue: defaults.highlightDates as boolean,
						icon: calendarClearOutline,
						label: 'highlightDates'
					}),
					toggleSection('presetValue', {
						defaultValue: defaults.presetValue as boolean,
						icon: createOutline,
						label: 'presetValue'
					})
				);
				break;
			}
			case 'DatetimeInputItem': {
				sections.push(
					toggleSection('hidden', { defaultValue: defaults.hidden as boolean, icon: eyeOffOutline, label: 'hidden' }),
					chipSection('type', {
						defaultValue: defaults.type as string,
						label: 'type',
						options: [
							{ label: 'date', value: DateTimePickerType.DATE },
							{ label: 'date-time', value: DateTimePickerType.DATETIME },
							{ label: 'time', value: DateTimePickerType.TIME }
						]
					}),
					toggleSection('min', { defaultValue: defaults.min as boolean, icon: timeOutline, label: 'min' }),
					toggleSection('max', { defaultValue: defaults.max as boolean, icon: timeOutline, label: 'max' })
				);
				break;
			}
			case 'FabButton': {
				sections.push(
					chipSection('horizontal', {
						defaultValue: defaults.horizontal as string,
						label: 'horizontal',
						options: [
							{ label: 'start', value: 'start' },
							{ label: 'center', value: 'center' },
							{ label: 'end', value: 'end' }
						]
					}),
					chipSection('vertical', {
						defaultValue: defaults.vertical as string,
						label: 'vertical',
						options: [
							{ label: 'top', value: 'top' },
							{ label: 'center', value: 'center' },
							{ label: 'bottom', value: 'bottom' }
						]
					}),
					toggleSection('buttons', { defaultValue: defaults.buttons as boolean, icon: listOutline, label: 'buttons' }),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
			case 'IconLabel': {
				sections.push(
					toggleSection('bold', { defaultValue: defaults.bold as boolean, icon: textOutline, label: 'bold' }),
					chipSection('size', {
						defaultValue: defaults.size as string,
						label: 'size',
						options: [
							{ label: 'xs', value: 'xs' },
							{ label: 'sm', value: 'sm' },
							{ label: 'normal', value: 'normal' },
							{ label: 'lg', value: 'lg' },
							{ label: 'xl', value: 'xl' }
						]
					}),
					sectionColor('color', 'color', singleId(defaults.color as number[])),
					sectionColor('iconColor', 'iconColor', singleId(defaults.iconColor as number[]))
				);
				break;
			}
			case 'LabeledItem': {
				sections.push(
					toggleSection('transparent', {
						defaultValue: defaults.transparent as boolean,
						icon: layersOutline,
						label: 'transparent'
					}),
					toggleSection('icon', { defaultValue: defaults.icon as boolean, icon: imageOutline, label: 'icon' }),
					toggleSection('badge', { defaultValue: defaults.badge as boolean, icon: albumsOutline, label: 'badge' }),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
			case 'CustomItem': {
				sections.push(
					toggleSection('disabled', {
						defaultValue: defaults.disabled as boolean,
						icon: banOutline,
						label: 'disabled'
					}),
					toggleSection('hidden', { defaultValue: defaults.hidden as boolean, icon: eyeOffOutline, label: 'hidden' }),
					toggleSection('readonly', {
						defaultValue: defaults.readonly as boolean,
						icon: lockClosedOutline,
						label: 'readonly'
					}),
					toggleSection('transparent', {
						defaultValue: defaults.transparent as boolean,
						icon: layersOutline,
						label: 'transparent'
					}),
					toggleSection('icon', { defaultValue: defaults.icon as boolean, icon: imageOutline, label: 'icon' }),
					toggleSection('iconEnd', {
						defaultValue: defaults.iconEnd as boolean,
						icon: arrowForwardOutline,
						label: 'iconEnd'
					}),
					toggleSection('note', { defaultValue: defaults.note as boolean, icon: documentOutline, label: 'note' }),
					toggleSection('badge', { defaultValue: defaults.badge as boolean, icon: albumsOutline, label: 'badge' }),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
			case 'LocationInputItem': {
				sections.push(
					toggleSection('hidden', { defaultValue: defaults.hidden as boolean, icon: eyeOffOutline, label: 'hidden' }),
					toggleSection('helperText', {
						defaultValue: defaults.helperText as boolean,
						icon: helpCircleOutline,
						label: 'helperText'
					}),
					toggleSection('card', { defaultValue: defaults.card as boolean, icon: albumsOutline, label: 'card' })
				);
				break;
			}
			case 'Modal': {
				sections.push(
					toggleSection('informational', {
						defaultValue: defaults.informational as boolean,
						icon: informationOutline,
						label: 'informational'
					}),
					toggleSection('labels', { defaultValue: defaults.labels as boolean, icon: textOutline, label: 'labels' }),
					toggleSection('loading', {
						defaultValue: defaults.loading as boolean,
						icon: handLeftOutline,
						label: 'loading'
					}),
					toggleSection('breakpoints', {
						defaultValue: defaults.breakpoints as boolean,
						icon: chevronExpandOutline,
						label: 'breakpoints'
					}),
					toggleSection('title', { defaultValue: defaults.title as boolean, icon: textOutline, label: 'title' }),
					toggleSection('touched', {
						defaultValue: defaults.touched as boolean,
						icon: handLeftOutline,
						label: 'touched'
					})
				);
				break;
			}
			case 'Popover': {
				sections.push(
					toggleSection('extended', {
						defaultValue: defaults.extended as boolean,
						icon: expandOutline,
						label: 'extended'
					}),
					toggleSection('lazy', { defaultValue: defaults.lazy as boolean, icon: gridOutline, label: 'lazy' })
				);
				break;
			}
			case 'MultiSelectInputItem': {
				sections.push(
					toggleSection('multiple', {
						defaultValue: defaults.multiple as boolean,
						icon: listOutline,
						label: 'multiple'
					}),
					toggleSection('search', { defaultValue: defaults.search as boolean, icon: searchOutline, label: 'search' }),
					toggleSection('disabled', {
						defaultValue: defaults.disabled as boolean,
						icon: banOutline,
						label: 'disabled'
					}),
					toggleSection('readonly', {
						defaultValue: defaults.readonly as boolean,
						icon: lockClosedOutline,
						label: 'readonly'
					})
				);
				break;
			}
			case 'SegmentItem': {
				sections.push(
					chipSection('selected', {
						defaultValue: defaults.selected as string,
						label: 'selected',
						options: [
							{ label: 'one', value: 'one' },
							{ label: 'two', value: 'two' },
							{ label: 'three', value: 'three' }
						]
					})
				);
				break;
			}
			case 'MapWidget': {
				sections.push(
					toggleSection('searchable', {
						defaultValue: defaults.searchable as boolean,
						icon: searchOutline,
						label: 'searchable'
					}),
					toggleSection('tall', { defaultValue: defaults.tall as boolean, icon: resizeOutline, label: 'tall' })
				);
				break;
			}
			case 'Card': {
				sections.push(
					toggleSection('subtitle', {
						defaultValue: defaults.subtitle as boolean,
						icon: textOutline,
						label: 'subtitle'
					}),
					toggleSection('titleIconStart', {
						defaultValue: defaults.titleIconStart as boolean,
						icon: imageOutline,
						label: 'titleIconStart'
					}),
					toggleSection('titleIconEnd', {
						defaultValue: defaults.titleIconEnd as boolean,
						icon: imageOutline,
						label: 'titleIconEnd'
					}),
					toggleSection('readonly', {
						defaultValue: defaults.readonly as boolean,
						icon: lockClosedOutline,
						label: 'readonly'
					}),
					toggleSection('lazy', { defaultValue: defaults.lazy as boolean, icon: gridOutline, label: 'lazy' }),
					sectionColor('border', 'border', singleId(defaults.border as number[])),
					sectionColor('color', 'color', singleId(defaults.color as number[]))
				);
				break;
			}
		}

		return {
			onApply: (next: Record<string, unknown>) => {
				settings = { ...settings, [key]: next };
			},
			sections,
			state,
			title: `${key} props`
		};
	});

	let modalShowcaseOpen = $state(false);
	let popoverShowcaseOpen = $state(false);
	let multiSelectValue = $state<number[]>([0]);

	const segmentConfig = $derived.by((): SegmentConfig[] => {
		const selected = (settings.SegmentItem.selected as string) ?? 'one';
		return [
			{
				clicked: () => {
					settings = { ...settings, SegmentItem: { ...settings.SegmentItem, selected: 'one' } };
				},
				label: 'One',
				selected: selected === 'one'
			},
			{
				clicked: () => {
					settings = { ...settings, SegmentItem: { ...settings.SegmentItem, selected: 'two' } };
				},
				label: 'Two',
				selected: selected === 'two'
			},
			{
				clicked: () => {
					settings = { ...settings, SegmentItem: { ...settings.SegmentItem, selected: 'three' } };
				},
				label: 'Three',
				selected: selected === 'three'
			}
		];
	});
</script>

<LayoutComponent title="Showcase">
	<ion-searchbar onionInput={onFilterInput} value={query} color="light"></ion-searchbar>
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

	{#if matches('Button')}
		<Card
			title="Button"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('Button')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('Button')}
		>
			<div class="flex items-center justify-center">
				{#if settings.Button.readonly as boolean}
					<Button
						label="Button"
						readonly={true}
						disabled={settings.Button.disabled as boolean}
						{...settings.Button.fill === 'unset' ? {} : { fill: settings.Button.fill as any }}
						{...settings.Button.size === 'unset' ? {} : { size: settings.Button.size as any }}
						{...settings.Button.shape === 'unset' ? {} : { shape: settings.Button.shape as any }}
						{...settings.Button.expand === 'unset' ? {} : { expand: settings.Button.expand as any }}
						{...settings.Button.iconSize === 'unset' ? {} : { iconSize: settings.Button.iconSize as any }}
						{...(settings.Button.icon as boolean) ? { icon: addOutline } : {}}
						{...(settings.Button.iconEnd as boolean) ? { iconEnd: addOutline } : {}}
						color={toColor(singleId(settings.Button.color as number[]))}
					/>
				{:else}
					<Button
						label="Button"
						disabled={settings.Button.disabled as boolean}
						{...settings.Button.fill === 'unset' ? {} : { fill: settings.Button.fill as any }}
						{...settings.Button.size === 'unset' ? {} : { size: settings.Button.size as any }}
						{...settings.Button.shape === 'unset' ? {} : { shape: settings.Button.shape as any }}
						{...settings.Button.expand === 'unset' ? {} : { expand: settings.Button.expand as any }}
						{...settings.Button.iconSize === 'unset' ? {} : { iconSize: settings.Button.iconSize as any }}
						{...(settings.Button.icon as boolean) ? { icon: addOutline } : {}}
						{...(settings.Button.iconEnd as boolean) ? { iconEnd: addOutline } : {}}
						color={toColor(singleId(settings.Button.color as number[]))}
						clicked={() => showAlert('Button clicked', { type: AlertType.SUCCESS })}
					/>
				{/if}
			</div>
		</Card>
	{/if}

	{#if matches('Chip')}
		<Card
			title="Chip"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('Chip')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('Chip')}
		>
			<div class="flex items-center justify-center">
				<Chip
					label="Chip"
					selected={settings.Chip.selected as boolean}
					color={toColor(singleId(settings.Chip.color as number[]))}
					iconColor={toColor(singleId(settings.Chip.iconColor as number[]))}
					{...(settings.Chip.icon as boolean) ? { icon: personOutline } : {}}
					{...(settings.Chip.iconEnd as boolean) ? { iconEnd: personOutline } : {}}
					clicked={() => showAlert('Chip clicked', { type: AlertType.SUCCESS })}
				/>
			</div>
		</Card>
	{/if}

	{#if matches('ToggleItem')}
		<Card
			title="ToggleItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('ToggleItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('ToggleItem')}
		>
			<ToggleItem
				label="Toggle"
				disabled={settings.ToggleItem.disabled as boolean}
				checked={settings.ToggleItem.checked as boolean}
				{...(settings.ToggleItem.icon as boolean) ? { icon: personOutline } : {}}
				changed={() => showAlert('Toggle changed', { type: AlertType.SUCCESS })}
			/>
		</Card>
	{/if}

	{#if matches('InputItem')}
		<Card
			title="InputItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('InputItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('InputItem')}
		>
			<InputItem
				label="Input"
				value=""
				disabled={settings.InputItem.disabled as boolean}
				readonly={settings.InputItem.readonly as boolean}
				hidden={settings.InputItem.hidden as boolean}
				uppercase={settings.InputItem.uppercase as boolean}
				color={toColor(singleId(settings.InputItem.color as number[]))}
				{...(settings.InputItem.type as string) === 'unset' ? {} : { type: settings.InputItem.type as any }}
				{...(settings.InputItem.helperText as boolean) ? { helperText: 'Helper text' } : {}}
				{...(settings.InputItem.icon as boolean) ? { icon: personOutline } : {}}
				{...(settings.InputItem.inputIcon as boolean)
					? {
							inputIcon: attachOutline,
							inputIconClicked: () => showAlert('Input icon clicked', { type: AlertType.SUCCESS })
						}
					: {}}
			/>
		</Card>
	{/if}

	{#if matches('TextareaInputItem')}
		<Card
			title="TextareaInputItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('TextareaInputItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('TextareaInputItem')}
		>
			<TextareaInputItem
				label="Textarea"
				value=""
				disabled={settings.TextareaInputItem.disabled as boolean}
				readonly={settings.TextareaInputItem.readonly as boolean}
				hidden={settings.TextareaInputItem.hidden as boolean}
				color={toColor(singleId(settings.TextareaInputItem.color as number[]))}
				{...(settings.TextareaInputItem.placeholder as boolean) ? { placeholder: 'Placeholder' } : {}}
				{...(settings.TextareaInputItem.maxlength as boolean) ? { maxlength: 120 } : {}}
				{...(settings.TextareaInputItem.icon as boolean) ? { icon: personOutline } : {}}
				{...(settings.TextareaInputItem.iconEnd as boolean)
					? { iconEnd: attachOutline, inputIconClicked: () => showAlert('Icon clicked', { type: AlertType.SUCCESS }) }
					: {}}
			/>
		</Card>
	{/if}

	{#if matches('AmountInputItem')}
		<Card
			title="AmountInputItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('AmountInputItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('AmountInputItem')}
		>
			<AmountInputItem
				label="Amount"
				value={0}
				disabled={settings.AmountInputItem.disabled as boolean}
				readonly={settings.AmountInputItem.readonly as boolean}
				hidden={settings.AmountInputItem.hidden as boolean}
				color={toColor(singleId(settings.AmountInputItem.color as number[]))}
				{...(settings.AmountInputItem.helperText as boolean) ? { helperText: 'Helper text' } : {}}
				{...(settings.AmountInputItem.inputIcon as boolean)
					? { inputIcon: attachOutline, inputIconClicked: () => showAlert('Icon clicked', { type: AlertType.SUCCESS }) }
					: {}}
				changed={() => {}}
			/>
		</Card>
	{/if}

	{#if matches('Datetime')}
		<Card
			title="Datetime"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('Datetime')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('Datetime')}
		>
			<Datetime
				showButtons={settings.Datetime.showButtons as boolean}
				showTitle={settings.Datetime.showTitle as boolean}
				type={settings.Datetime.type as DateTimePickerType}
				{...(settings.Datetime.highlightDates as boolean) ? { dates: ['2026-01-01'] } : {}}
				{...(settings.Datetime.presetValue as boolean) ? { value: '2026-01-01' } : {}}
				applied={() => showAlert('Datetime applied', { type: AlertType.SUCCESS })}
			/>
		</Card>
	{/if}

	{#if matches('DatetimeInputItem')}
		<Card
			title="DatetimeInputItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('DatetimeInputItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('DatetimeInputItem')}
		>
			<DatetimeInputItem
				label="Datetime"
				value=""
				hidden={settings.DatetimeInputItem.hidden as boolean}
				type={settings.DatetimeInputItem.type as DateTimePickerType}
				{...(settings.DatetimeInputItem.min as boolean) ? { min: '2026-01-01' } : {}}
				{...(settings.DatetimeInputItem.max as boolean) ? { max: '2026-12-31' } : {}}
				changed={() => {}}
			/>
		</Card>
	{/if}

	{#if matches('FabButton')}
		<Card
			title="FabButton"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('FabButton')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('FabButton')}
		>
			<div class="relative h-32">
				<FabButton
					icon={addOutline}
					indexLabel="fab"
					horizontal={settings.FabButton.horizontal as any}
					vertical={settings.FabButton.vertical as any}
					color={toColor(singleId(settings.FabButton.color as number[]))}
					buttons={(settings.FabButton.buttons as boolean)
						? [{ handler: () => showAlert('Action', { type: AlertType.SUCCESS }), icon: addOutline, label: 'Action' }]
						: []}
					clicked={() => showAlert('FAB clicked', { type: AlertType.SUCCESS })}
				/>
			</div>
		</Card>
	{/if}

	{#if matches('IconLabel')}
		<Card
			title="IconLabel"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('IconLabel')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('IconLabel')}
		>
			<IconLabel
				icon={documentOutline}
				label="IconLabel"
				bold={settings.IconLabel.bold as boolean}
				size={settings.IconLabel.size as any}
				color={toColor(singleId(settings.IconLabel.color as number[]))}
				iconColor={toColor(singleId(settings.IconLabel.iconColor as number[]))}
			/>
		</Card>
	{/if}

	{#if matches('LabeledItem')}
		<Card
			title="LabeledItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('LabeledItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('LabeledItem')}
		>
			<LabeledItem
				label="Labeled item"
				transparent={settings.LabeledItem.transparent as boolean}
				color={toColor(singleId(settings.LabeledItem.color as number[]))}
				{...(settings.LabeledItem.icon as boolean) ? { icon: documentOutline } : {}}
				{...(settings.LabeledItem.badge as boolean) ? { badge: '1' } : {}}
				clicked={() => showAlert('Clicked', { type: AlertType.SUCCESS })}
			/>
		</Card>
	{/if}

	{#if matches('CustomItem')}
		<Card
			title="CustomItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('CustomItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('CustomItem')}
		>
			<CustomItem
				color={toColor(singleId(settings.CustomItem.color as number[]))}
				disabled={settings.CustomItem.disabled as boolean}
				hidden={settings.CustomItem.hidden as boolean}
				readonly={settings.CustomItem.readonly as boolean}
				transparent={settings.CustomItem.transparent as boolean}
				{...(settings.CustomItem.icon as boolean) ? { icon: personOutline } : {}}
				{...(settings.CustomItem.iconEnd as boolean)
					? { iconClicked: () => showAlert('iconEnd clicked', { type: AlertType.SUCCESS }), iconEnd: mapOutline }
					: {}}
				{...(settings.CustomItem.note as boolean) ? { note: 'Note' } : {}}
				{...(settings.CustomItem.badge as boolean) ? { badge: '!' } : {}}
				clicked={() => showAlert('CustomItem clicked', { type: AlertType.SUCCESS })}
			>
				<div class="flex w-full items-center justify-between gap-4">
					<ion-label>Content</ion-label>
					<ion-text color="medium" class="text-sm">Right</ion-text>
				</div>
			</CustomItem>
		</Card>
	{/if}

	{#if matches('LocationInputItem')}
		<Card
			title="LocationInputItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('LocationInputItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('LocationInputItem')}
		>
			<LocationInputItem
				label="Location"
				value=""
				hidden={settings.LocationInputItem.hidden as boolean}
				{...(settings.LocationInputItem.helperText as boolean) ? { helperText: 'Pick a location on the map' } : {}}
				changed={() => {}}
			/>
		</Card>
	{/if}

	{#if matches('Modal')}
		<Card
			title="Modal"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('Modal')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('Modal')}
		>
			<div class="text-center">
				<Button label="Open modal" icon={addOutline} clicked={() => (modalShowcaseOpen = true)} />
			</div>
			<Modal
				open={modalShowcaseOpen}
				breakpoints={settings.Modal.breakpoints as boolean}
				labels={settings.Modal.labels as boolean}
				loading={settings.Modal.loading as boolean}
				informational={settings.Modal.informational as boolean}
				{...(settings.Modal.title as boolean) ? { title: 'Modal title' } : {}}
				touched={settings.Modal.touched as boolean}
				dismissed={() => (modalShowcaseOpen = false)}
				confirmed={() => showAlert('Confirmed', { type: AlertType.SUCCESS })}
			>
				<ion-text>This is a modal.</ion-text>
			</Modal>
		</Card>
	{/if}

	{#if matches('Popover')}
		<Card
			title="Popover"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('Popover')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('Popover')}
		>
			<div class="text-center">
				<Button label="Open popover" clicked={() => (popoverShowcaseOpen = true)} />
			</div>
			<Popover
				open={popoverShowcaseOpen}
				extended={settings.Popover.extended as boolean}
				lazy={settings.Popover.lazy as boolean}
				dismissed={() => (popoverShowcaseOpen = false)}
			>
				<div class="p-5">This is a popover.</div>
			</Popover>
		</Card>
	{/if}

	{#if matches('MultiSelectInputItem')}
		<Card
			title="MultiSelectInputItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('MultiSelectInputItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('MultiSelectInputItem')}
		>
			<MultiSelectInputItem
				icon={calendarClearOutline}
				label="Select"
				items={[
					{ data: { id: 0, label: '(none)' }, selected: true },
					{ data: { id: 1, label: 'One' } },
					{ data: { id: 2, label: 'Two' } },
					{ data: { id: 3, label: 'Three' } }
				]}
				multiple={settings.MultiSelectInputItem.multiple as boolean}
				search={settings.MultiSelectInputItem.search as boolean}
				disabled={settings.MultiSelectInputItem.disabled as boolean}
				readonly={settings.MultiSelectInputItem.readonly as boolean}
				value={multiSelectValue}
				changed={(ids) => (multiSelectValue = ids)}
			/>
		</Card>
	{/if}

	{#if matches('SegmentItem')}
		<Card
			title="SegmentItem"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('SegmentItem')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('SegmentItem')}
		>
			<SegmentItem config={segmentConfig}>
				<div class="p-4">Selected: {settings.SegmentItem.selected as string}</div>
			</SegmentItem>
		</Card>
	{/if}

	{#if matches('Card')}
		<Card
			title="Card"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('Card')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('Card')}
		>
			<Card
				title="Inner Card"
				subtitle={(settings.Card.subtitle as boolean) ? 'Subtitle' : undefined}
				readonly={settings.Card.readonly as boolean}
				lazy={settings.Card.lazy as boolean}
				border={toColor(singleId(settings.Card.border as number[]))}
				color={toColor(singleId(settings.Card.color as number[]))}
				titleIconStart={(settings.Card.titleIconStart as boolean) ? documentOutline : undefined}
				titleIconEnd={(settings.Card.titleIconEnd as boolean) ? attachOutline : undefined}
			>
				<div class="p-2">Card content</div>
			</Card>
		</Card>
	{/if}

	{#if matches('MapWidget')}
		<Card
			title="MapWidget"
			titleIconStart={informationOutline}
			titleIconStartClicked={() => openInfoModal('MapWidget')}
			titleIconEnd={optionsOutline}
			titleIconEndClicked={() => openFilter('MapWidget')}
		>
			<MapView
				searchable={settings.MapWidget.searchable as boolean}
				classList={(settings.MapWidget.tall as boolean) ? 'h-[70vh]' : 'h-[35vh]'}
				selected={() => {}}
			/>
		</Card>
	{/if}

	{#if activeFilterConfig}
		<FilterPanel config={activeFilterConfig} open={filterOpen} dismissed={dismissFilter} />
	{/if}
</LayoutComponent>
