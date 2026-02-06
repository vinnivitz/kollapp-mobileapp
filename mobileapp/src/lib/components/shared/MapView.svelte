<script lang="ts">
	import type { AddressModel, PositionItem } from '$lib/models/osm';
	import type { SearchbarInputEventDetail } from '@ionic/core';

	import { searchOutline } from 'ionicons/icons';
	import { LatLng, type LeafletMouseEvent, Map, Marker, TileLayer } from 'leaflet';

	import { osmService } from '$lib/api/services';
	import { CustomItem } from '$lib/components/core';
	import environment from '$lib/environment';
	import { t } from '$lib/locales';
	import { StorageKey } from '$lib/models/storage';
	import { clickOutside, getStoredValue, uniqueBy } from '$lib/utility';

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
	let searchbarOpen = $state<boolean>(false);
	let searchItems = $state<PositionItem[]>([]);
	let searchbar = $state<HTMLIonSearchbarElement>();
	let mapContainer = $state<HTMLDivElement>();
	let mapInitialized = $state<boolean>(false);

	$effect(() => {
		if (mapContainer && !map && !mapInitialized) {
			mapInitialized = true;
			setTimeout(() => {
				if (mapContainer && !map) {
					initializeMap(value);
				}
			}, 0);
		}

		return () => {
			if (map) {
				map.off();
				map.remove();
				map = undefined;
				mapInitialized = false;
			}
		};
	});

	$effect(() => {
		if (value && map) {
			updateMarkerFromValue(value);
		}
	});

	async function updateMarkerFromValue(value: string): Promise<void> {
		if (!map) return;
		const response = await osmService.getLocationsByQuery(value);
		const item = response[0];
		if (item) {
			await setMarker(item.latlng);
		}
	}

	async function initializeMap(value?: string): Promise<void> {
		if (!mapContainer) return;

		const coordinates = (await getStoredValue(StorageKey.POSITION)) || JSON.parse(environment.defaultPosition);
		const latlng = new LatLng(coordinates[0], coordinates[1]);

		map = new Map(mapContainer, {
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
			await updateMarkerFromValue(value);
		}
	}

	async function handleMapClick(event_: LeafletMouseEvent): Promise<void> {
		await setMarker(event_.latlng);
	}

	async function setMarker(latlng: LatLng): Promise<void> {
		marker?.removeFrom(map!);
		marker = new Marker(latlng).addTo(map!);
		map?.setView(latlng, 16);
		const address = await osmService.getLocationByLatLng(latlng);
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

	async function onSearch(query: string | undefined): Promise<void> {
		query = query?.trim();
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
		const response = await osmService.getLocationsByQuery(query);
		searchItems = uniqueBy(
			response.map((item) => ({
				icon: item.icon,
				latlng: item.latlng as LatLng,
				name: formatAddress(item)
			})),
			(item) => item.name
		);
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
<div bind:this={mapContainer} class="absolute top-0 right-0 bottom-0 left-0 z-0 w-full"></div>

{#snippet search()}
	{#if searchbarOpen}
		<div class="absolute top-1 right-1 z-10 w-5/6" use:clickOutside onblur={closeSearchbar}>
			<ion-searchbar
				bind:this={searchbar}
				debounce={250}
				class="absolute transition-transform"
				color="light"
				aria-label={$t('accessibility.actions.search')}
				placeholder={$t('components.widgets.leaflet-map.searchbar.placeholder')}
				onionInput={(event_: CustomEvent<SearchbarInputEventDetail>) => onSearch(event_.detail?.value ?? '')}
			></ion-searchbar>
			<ion-list
				class="absolute top-13 right-3 left-3 mx-auto rounded-xl"
				role="listbox"
				aria-label={$t('accessibility.actions.search')}
			>
				{#each searchItems as item (item.latlng)}
					{#if item.name}
						<CustomItem
							icon={item.icon}
							color="light"
							clicked={() => onSearchItemSelection(item.latlng)}
							ariaLabel={item.name}
						>
							<ion-label class="ms-2">{item.name}</ion-label>
						</CustomItem>
					{/if}
				{/each}
			</ion-list>
		</div>
	{:else}
		<ion-fab-button
			role="button"
			tabindex="0"
			aria-label={$t('accessibility.actions.search')}
			onkeydown={(event: KeyboardEvent) => event.key === 'Enter' && onOpenSearchbar()}
			size="small"
			color="light"
			class="absolute top-1 right-1 z-10"
			onclick={onOpenSearchbar}
		>
			<ion-icon icon={searchOutline} aria-hidden="true"></ion-icon>
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
