<script lang="ts">
	import type { InputInputEventDetail } from '@ionic/core';

	import { cashOutline } from 'ionicons/icons';
	import { get } from 'svelte/store';

	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import { type Colors, Currency, type NumberStyle } from '$lib/models/ui';
	import { localeStore } from '$lib/stores';

	type Properties = {
		label: string;
		name: string;
		card?: boolean;
		classList?: string;
		color?: Colors;
		currency?: Currency;
		disabled?: boolean;
		helperText?: string;
		icon?: string;
		inputIcon?: string;
		maximumFractionDigits?: number;
		minimumFractionDigits?: number;
		readonly?: boolean;
		style?: NumberStyle;
		unit?: string;
		unitDisplay?: 'long' | 'narrow' | 'short';
		value?: number;
		changed?: (value: string) => void;
		clicked?: () => void;
		inputElement?: (element: HTMLIonInputElement) => void;
		inputIconClicked?: () => void;
	};

	let {
		card,
		changed,
		classList = '',
		clicked,
		color,
		currency = Currency.EUR,
		disabled,
		helperText,
		icon = cashOutline,
		inputElement,
		inputIcon,
		inputIconClicked,
		label,
		maximumFractionDigits,
		minimumFractionDigits,
		name,
		readonly,
		style = 'currency',
		unit,
		unitDisplay,
		value
	}: Properties = $props();

	let element = $state<HTMLIonInputElement>();

	$effect(() => {
		if (element) inputElement?.(element);
	});

	async function setCaretBeforeUnit(): Promise<void> {
		const native = (await element?.getInputElement()) as HTMLInputElement;
		const index = caretIndexBeforeTrailingUnit(native.value);
		requestAnimationFrame(() => native.setSelectionRange(index, index));
	}

	function caretIndexBeforeTrailingUnit(text: string): number {
		if (!text) return 0;
		let index = text.length - 1;
		while (index >= 0 && isWhitespace(text[index] as string)) index--;
		if (index < 0) return 0;
		const ch = text[index] as string;
		if (/[0-9.,'’]/.test(ch)) return text.length;
		let index_ = index - 1;
		while (index_ >= 0 && isWhitespace(text[index_] as string)) index_--;
		return index_ + 1;
	}

	function isWhitespace(character: string): boolean {
		return /[\s\u00A0\u202F]/.test(character);
	}

	function getDecimalSeparator(): string {
		const probe = new Intl.NumberFormat(get(localeStore), {
			maximumFractionDigits: 1,
			minimumFractionDigits: 1
		}).format(1.1);
		const m = probe.match(/1([^\d])1/);
		return m?.[1] ?? ',';
	}

	async function onIonInput(
		event: CustomEvent<InputInputEventDetail> & { target: HTMLIonInputElement }
	): Promise<void> {
		changed?.(event.detail?.value || '');
		const native = await element?.getInputElement();
		if (!native) return;
		const fix = (): void => {
			const index = caretIndexBeforeTrailingUnit(native.value);
			if (native.setSelectionRange) native.setSelectionRange(index, index);
		};
		requestAnimationFrame(() => {
			fix();
			requestAnimationFrame(fix);
		});
	}

	async function onKeyDown(event: KeyboardEvent): Promise<void> {
		if (event.key !== '.' && event.key !== ',') return;
		event.preventDefault();
		const native = (await element?.getInputElement()) as HTMLInputElement;
		const current = native.value;
		const separator = getDecimalSeparator();
		if (current.includes(separator)) {
			const index = caretIndexBeforeTrailingUnit(current);
			requestAnimationFrame(() => native.setSelectionRange(index, index));
			return;
		}
		const insertAt = caretIndexBeforeTrailingUnit(current);
		const next = current.slice(0, insertAt) + separator + current.slice(insertAt);
		native.value = next;
		changed?.(next);
		requestAnimationFrame(() => native.setSelectionRange(insertAt + 1, insertAt + 1));
	}

	function buildNumberFormat(): Intl.NumberFormat {
		const locale = get(localeStore);
		const options: Intl.NumberFormatOptions = {
			maximumFractionDigits,
			minimumFractionDigits
		};

		if (style === 'currency') {
			options.style = 'currency';
			options.currency = currency;
			// sensible defaults for currency if not provided
			if (options.minimumFractionDigits === undefined) options.minimumFractionDigits = 2;
			if (options.maximumFractionDigits === undefined) options.maximumFractionDigits = 2;
		} else if (style === 'unit') {
			options.style = 'unit';
			if (unit) options.unit = unit as Intl.NumberFormatOptions['unit'];
			if (unitDisplay) options.unitDisplay = unitDisplay;
		} else {
			options.style = 'decimal';
		}

		return new Intl.NumberFormat(locale, options);
	}

	const nf = $derived(buildNumberFormat());

	const placeholder = $derived(nf.format(0));

	const displayed = $derived(value != undefined && value !== 0 ? nf.format(value) : undefined);
</script>

<CustomItem {card} {color} {icon} iconEnd={inputIcon} {clicked} iconClick={inputIconClicked} {classList}>
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-input
		bind:this={element}
		{readonly}
		label-placement="floating"
		{name}
		{label}
		type="text"
		inputmode="numeric"
		{disabled}
		helper-text={helperText}
		value={displayed}
		{placeholder}
		on:ionFocus={setCaretBeforeUnit}
		on:focus={setCaretBeforeUnit}
		on:keydown={onKeyDown}
		on:ionInput={onIonInput}
		role="menuitem"
		tabindex="0"
	>
	</ion-input>
</CustomItem>

<style>
	ion-input {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}
</style>
