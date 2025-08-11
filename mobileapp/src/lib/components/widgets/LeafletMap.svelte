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
		searchable?: boolean;
		value?: string;
		selected?: (name: string) => void;
	};

	const TILE_LAYER_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
	const TILE_LAYER_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

	let { classList = '', searchable = true, selected, value }: Properties = $props();
	let map: Map | undefined;
	let marker: Marker | undefined;
	let searchbarOpen = $state(false);
	let searchItems = $state<PositionItem[]>([]);
	let searchbar = $state<HTMLIonSearchbarElement>();

	onMount(() => initializeMap(value));

	onDestroy(() => map?.remove());

	async function initializeMap(value?: string): Promise<void> {
		const coordinates = (await getStoredValue(PreferencesKey.POSITION)) || JSON.parse(environment.defaultPosition);
		const latlng = new LatLng(coordinates[0], coordinates[1]);
		if (document.querySelector('.leaflet-container')) return;
		map = new Map('map', {
			center: latlng,
			doubleClickZoom: true,
			zoom: 16,
			zoomControl: true
		});
		map.on('click', handleMapClick);
		new TileLayer(TILE_LAYER_URL, {
			attribution: TILE_LAYER_ATTRIBUTION,
			maxNativeZoom: 19,
			maxZoom: 20
		}).addTo(map);
		if (value) {
			const response = await osmResource.getLocationsByQuery(value);
			const item = response[0];
			if (item) {
				await setMarker(item.latlng);
			}
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
		if (!query) {
			searchItems = [];
			return;
		}
		if (isCoordinate(query)) {
			const coordinates = query.split(',').map((coordinate) => Number.parseFloat(coordinate.trim()));
			const latlng = new LatLng(coordinates[0]!, coordinates[1]!);
			await setMarker(latlng);
			return;
		}
		const response = await osmResource.getLocationsByQuery(query);
		searchItems = response.map((item) => ({
			latlng: item.latlng as LatLng,
			name: formatAddress(item)
		}));
	}

	function isCoordinate(value: string): boolean {
		// eslint-disable-next-line security/detect-unsafe-regex
		return !!/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/.test(value.trim());
	}

	function formatAddress(address: AddressModel): string {
		if (address.street) {
			return `${address.street}${address.number ? ' ' + address.number : ''}, ${address.zip} ${address.locality}`;
		}
		if (address.locality) {
			return `${address.locality}${address.zip ? ', ' + address.zip : ''}`;
		}
		return '';
	}

	function onSearchItemSelection(latlng: LatLng): void {
		setMarker(latlng);
		closeSearchbar();
	}

	function closeSearchbar(): void {
		searchbarOpen = false;
		searchItems = [];
	}

	async function onOpenSearchbar(): Promise<void> {
		searchbarOpen = true;
		setTimeout(() => searchbar?.setFocus(), 10);
	}
</script>

<div class={`relative ${classList}`}>
	{#if searchable}
		{@render search()}
	{/if}
</div>
<div class="absolute top-0 right-0 bottom-0 left-0 z-0 w-full" id="map"></div>

{#snippet search()}
	{#if searchbarOpen}
		<!-- svelte-ignore event_directive_deprecated -->
		<div class="absolute top-1 right-1 z-10 w-5/6" use:clickOutside on:blur={closeSearchbar}>
			<!-- svelte-ignore event_directive_deprecated -->
			<ion-searchbar
				bind:this={searchbar}
				debounce={250}
				class="absolute transition-transform"
				color="light"
				placeholder={$t('components.widgets.map.searchbar.placeholder')}
				on:ionInput={(event_) => onSearch(event_.target.value)}
			></ion-searchbar>
			<ion-list class="absolute top-13 right-3 left-3 mx-auto rounded-xl">
				{#each searchItems as item (item.latlng)}
					<!-- svelte-ignore event_directive_deprecated -->
					<ion-item
						role="button"
						tabindex="0"
						on:keydown={(_event) => _event.key === 'Enter' && onSearchItemSelection(item.latlng)}
						color="light"
						on:click={() => onSearchItemSelection(item.latlng)}
					>
						<ion-label>{item.name}</ion-label>
					</ion-item>
				{/each}
			</ion-list>
		</div>
	{:else}
		<!-- svelte-ignore event_directive_deprecated -->
		<ion-fab-button
			role="button"
			tabindex="0"
			on:keydown={(_event) => _event.key === 'Enter' && onOpenSearchbar()}
			size="small"
			color="light"
			class="absolute top-1 right-1 z-10"
			on:click={onOpenSearchbar}
		>
			<ion-icon icon={searchOutline}></ion-icon>
		</ion-fab-button>
	{/if}
{/snippet}

<style>
	ion-searchbar {
		--border-radius: 25px;
	}

	ion-list {
		:first-child {
			--border-radius: 25px 25px 0 0;
		}
		:last-child {
			--border-radius: 0 0 25px 25px;
		}
	}
</style>
