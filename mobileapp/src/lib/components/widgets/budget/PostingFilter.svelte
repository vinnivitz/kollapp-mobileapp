<script lang="ts" generics="TState extends Record<string, unknown>">
	import type { FilterConfig, FilterSection } from '$lib/models/ui';

	import { downloadOutline, filterOutline, refreshOutline, saveOutline } from 'ionicons/icons';

	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';
	import DatetimeInputItem from '$lib/components/widgets/ionic/DatetimeInputItem.svelte';
	import MultiSelectInputItem from '$lib/components/widgets/ionic/MultiSelectInputItem.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import { t } from '$lib/locales';

	type Properties = {
		config: FilterConfig<TState>;
		classList?: string;
		onExportPostings?: () => void;
	};

	let { classList = '', config, onExportPostings }: Properties = $props();

	let open = $state(false);
	let draft = $state<Record<string, unknown>>({});

	const showSearchbar = $derived(!!config.searchbar);
	const showFilterButton = $derived(config.sections.length > 0);

	function getDefaultsFromSections(): Record<string, unknown> {
		const defaults: Record<string, unknown> = {};
		for (const section of config.sections) {
			switch (section.type) {
				case 'multi-select': {
					defaults[section.key] = section.items.filter((item) => item.selected).map((item) => item.data.id);
					break;
				}
				case 'date-range': {
					defaults[section.key] = {
						from: section.defaultFromValue,
						to: section.defaultToValue
					};
					break;
				}
				default: {
					defaults[section.key] = section.defaultValue;
					break;
				}
			}
		}
		return defaults;
	}

	const effectiveState = $derived(config.state ?? getDefaultsFromSections());

	const multiSelectDefaultValue = $derived(
		config.sections
			.find((section) => section.type === 'multi-select')
			?.items.filter((item) => item.selected)
			.map((item) => item.data.id) ?? []
	);

	const hasFiltersApplied = $derived.by(() => {
		const defaults = getDefaultsFromSections();
		for (const section of config.sections) {
			const currentValue = effectiveState[section.key];
			const defaultValue = defaults[section.key];
			if (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) {
				return true;
			}
		}
		return false;
	});

	$effect(() => {
		if (open) {
			draft = { ...effectiveState };
		}
	});

	function getDraftValue<T>(key: string, defaultValue: T): T {
		return (draft[key] as T) ?? defaultValue;
	}

	function setDraftValue(key: string, value: unknown): void {
		draft = { ...draft, [key]: value };
	}

	function getDateRangeDraft(key: string): { from: string; to: string } {
		return (draft[key] as { from: string; to: string }) ?? { from: '', to: '' };
	}

	function setDateRangeDraft(key: string, field: 'from' | 'to', value: string): void {
		const current = getDateRangeDraft(key);
		draft = { ...draft, [key]: { ...current, [field]: value } };
	}

	async function handleApply(): Promise<void> {
		open = false;
		config.onApply(draft as NonNullable<typeof config.state>);
	}

	async function handleReset(): Promise<void> {
		const defaults = getDefaultsFromSections();
		draft = defaults;
		config.onApply(defaults as NonNullable<typeof config.state>);
		config.onReset?.();
		open = false;
	}

	function handleDismiss(): void {
		draft = { ...effectiveState };
		open = false;
	}

	async function handleInlineReset(): Promise<void> {
		await handleReset();
	}

	function toggleMultiChipValue<T extends string>(currentValues: T[], value: T): T[] {
		if (currentValues.includes(value)) {
			if (currentValues.length === 1) return currentValues;
			return currentValues.filter((v) => v !== value);
		}
		return [...currentValues, value];
	}

	function isChipsSection(section: FilterSection): section is FilterSection & { type: 'chips' } {
		return section.type === 'chips';
	}

	function isChipsMultiSection(section: FilterSection): section is FilterSection & { type: 'chips-multi' } {
		return section.type === 'chips-multi';
	}

	function isDateRangeSection(section: FilterSection): section is FilterSection & { type: 'date-range' } {
		return section.type === 'date-range';
	}

	function isMultiSelectSection(section: FilterSection): section is FilterSection & { type: 'multi-select' } {
		return section.type === 'multi-select';
	}

	function handleSearchInput(event: CustomEvent): void {
		const value = event.detail.value ?? '';
		config.searchbar?.onSearch(value);
	}

	function openPopover(): void {
		open = true;
	}
</script>

{#if showSearchbar || showFilterButton}
	<div class={classList}>
		<div class="flex items-center justify-between gap-2">
			{#if showSearchbar}
				<ion-searchbar
					debounce={100}
					placeholder={config.searchbar?.placeholder ?? $t('components.widgets.filter.search-placeholder')}
					onionInput={handleSearchInput}
					value={config.searchbar?.value ?? ''}
				></ion-searchbar>
			{/if}
			{#if showFilterButton}
				<Button fill="solid" color="secondary" clicked={openPopover} icon={filterOutline} />
			{/if}
			{#if onExportPostings}
				<Button color="tertiary" icon={downloadOutline} clicked={() => onExportPostings?.()}></Button>
			{/if}
		</div>
		{#if hasFiltersApplied}
			<div class="flex justify-center">
				<Button
					size="small"
					fill="outline"
					color="danger"
					icon={refreshOutline}
					label={config.resetFiltersLabel ?? $t('components.widgets.filter.reset-filters')}
					clicked={handleInlineReset}
				/>
			</div>
		{/if}
	</div>
{/if}

<Popover extended {open} dismissed={handleDismiss} lazy>
	<Card title={config.title} classList="m-0">
		{#each config.sections as section (section.key)}
			{#if isChipsSection(section)}
				{@const currentValue = getDraftValue(section.key, section.defaultValue)}
				<div class="mb-3">
					<ion-text color="medium" class="text-sm">
						{section.label}
					</ion-text>
					<div class="mt-1 flex flex-wrap items-center justify-center gap-2">
						{#each section.options as option (option.value)}
							<Chip
								clicked={() => setDraftValue(section.key, option.value)}
								selected={currentValue === option.value}
								color={option.color}
								icon={option.icon}
								label={option.label}
							/>
						{/each}
					</div>
				</div>
			{:else if isChipsMultiSection(section)}
				{@const currentValues = getDraftValue(section.key, section.defaultValue)}
				<div class="mb-3">
					<ion-text color="medium" class="text-sm">
						{section.label}
					</ion-text>
					<div class="mt-1 flex flex-wrap items-center justify-center gap-2">
						{#each section.options as option (option.value)}
							<Chip
								clicked={() => setDraftValue(section.key, toggleMultiChipValue(currentValues, option.value))}
								selected={currentValues.includes(option.value)}
								color={option.color}
								icon={option.icon}
								label={option.label}
							/>
						{/each}
					</div>
				</div>
			{:else if isDateRangeSection(section)}
				{@const range = getDateRangeDraft(section.key)}
				<div class="mb-3">
					{#if section.label}
						<ion-text color="medium" class="text-sm">
							{section.label}
						</ion-text>
					{/if}
					<DatetimeInputItem
						max={range.to || section.max}
						min={section.min}
						label={section.fromLabel ?? $t('components.widgets.filter.date-range.from')}
						value={range.from}
						changed={(value) => setDateRangeDraft(section.key, 'from', value)}
					/>
					<DatetimeInputItem
						min={range.from || section.min}
						max={section.max}
						label={section.toLabel ?? $t('components.widgets.filter.date-range.to')}
						value={range.to}
						changed={(value) => setDateRangeDraft(section.key, 'to', value)}
					/>
				</div>
			{:else if isMultiSelectSection(section)}
				{@const currentValue = getDraftValue(section.key, multiSelectDefaultValue)}
				<div class="mb-3">
					{#if section.label}
						<ion-text color="medium" class="text-sm">
							{section.label}
						</ion-text>
					{/if}
					<MultiSelectInputItem
						value={currentValue}
						changed={(value) => setDraftValue(section.key, value)}
						allSelectedText={section.allSelectedText}
						noneSelectedText={section.noneSelectedText}
						icon={section.icon}
						label={section.inputLabel}
						searchPlaceholder={section.searchPlaceholder}
						items={section.items}
					/>
				</div>
			{/if}
		{/each}

		<div class="mt-2 flex items-center justify-center gap-2">
			<Button
				label={config.resetLabel ?? $t('components.widgets.filter.reset')}
				color="danger"
				icon={refreshOutline}
				fill="outline"
				clicked={handleReset}
			/>
			<Button
				label={config.applyLabel ?? $t('components.widgets.filter.apply')}
				icon={saveOutline}
				fill="outline"
				clicked={handleApply}
			/>
		</div>
	</Card>
</Popover>
