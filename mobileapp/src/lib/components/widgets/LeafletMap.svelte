<script lang="ts">
	import type { AddressModel, PositionItem } from '$lib/models/osm';

	import { searchOutline } from 'ionicons/icons';
	import { LatLng, type LeafletMouseEvent, Map, Marker, TileLayer } from 'leaflet';
	import { onDestroy, onMount } from 'svelte';

	import { osmResource } from '$lib/api/resources';
	import environment from '$lib/environment';
	import { t } from '$lib/locales';
	import { PreferencesKey } from '$lib/models/preferences';
	import { clickOutside, getStoredValue } from '$lib/utility';

	type Properties = {
		classList?: string;
		height?: number;
		position?: LatLng;
		searchable?: boolean;
		selected?: (name: string) => void;
	};

	let { classList, height = 70, position, searchable = false, selected }: Properties = $props();

	let map: Map | undefined;
	let marker: Marker | undefined;
	let searchbarOpen = $state(false);
	let searchItems = $state<PositionItem[]>([]);

	onMount(() => initializeMap(position));

	onDestroy(() => map?.remove());

	async function initializeMap(position?: LatLng): Promise<void> {
		if (map) return;
		const coordinates = (await getStoredValue(PreferencesKey.POSITION)) || JSON.parse(environment.defaultPosition);
		const latlng = new LatLng(coordinates[0], coordinates[1]);
		map = new Map('map', {
			center: latlng,
			doubleClickZoom: true,
			zoom: 16,
			zoomControl: true
		});
		map.on('click', handleMapClick);
		new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
			maxNativeZoom: 19,
			maxZoom: 20
		}).addTo(map);
		if (position) {
			await setMarker(position);
		}
	}

	async function handleMapClick(event_: LeafletMouseEvent): Promise<void> {
		await setMarker(event_.latlng);
	}

	async function setMarker(latlng: LatLng): Promise<void> {
		marker?.removeFrom(map!);
		marker = new Marker(latlng).addTo(map!);
		map?.setView(latlng, 16);
		const address = await osmResource.getLocationByLatLng(latlng);
		if (address) {
			const tooltip = formatAddress(address);
			marker
				?.bindTooltip(tooltip, {
					direction: 'top',
					offset: [-15, -15]
				})
				.openTooltip();
			selected?.(tooltip);
		}
	}

	async function onSearch(query: null | string | undefined): Promise<void> {
		if (query) {
			const response = await osmResource.getLocationsByQuery(query);
			searchItems = response.map((item) => ({
				latlng: item.latlng as LatLng,
				name: formatAddress(item)
			}));
		} else {
			searchItems = [];
		}
	}

	function formatAddress(address: AddressModel): string {
		if (address.street) {
			return `${address.street}${address.number ? ' ' + address.number : ''}, ${address.zip} ${address.locality}`;
		} else if (address.locality) {
			return `${address.locality}${address.zip ? ', ' + address.zip : ''}`;
		} else {
			return '';
		}
	}

	function onSearchItemSelection(latlng: LatLng): void {
		setMarker(latlng);
		closeSearchbar();
	}

	function closeSearchbar(): void {
		searchbarOpen = false;
		searchItems = [];
	}
</script>

<!-- svelte-ignore event_directive_deprecated -->
<div class={`relative ${classList}`}>
	{#if !searchable}
		{#if searchbarOpen}
			<!-- svelte-ignore event_directive_deprecated -->
			<div class="absolute top-1 right-1 z-10 w-5/6" use:clickOutside on:blur={closeSearchbar}>
				<ion-searchbar
					debounce={250}
					class="absolute transition-transform"
					color="light"
					placeholder={$t('components.widgets.map.searchbar.placeholder')}
					on:ionInput={(event_) => onSearch(event_.target.value)}
				></ion-searchbar>
				<ion-list class="absolute top-13 right-3 left-3 mx-auto rounded-xl">
					{#each searchItems as item (item.latlng)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<ion-item color="white" on:click={() => onSearchItemSelection(item.latlng)}>
							<ion-label>{item.name}</ion-label>
						</ion-item>
					{/each}
				</ion-list>
			</div>
		{:else}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-fab-button
				size="small"
				color="light"
				class="absolute top-1 right-1 z-10"
				on:click={() => (searchbarOpen = true)}
			>
				<ion-icon icon={searchOutline}></ion-icon>
			</ion-fab-button>
		{/if}
	{/if}
	<div class="z-0" id="map" style:height={`${height}vh`}></div>
</div>
