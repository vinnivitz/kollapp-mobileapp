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
		if (!element) return;
		const native = await element.getInputElement();
		const text = native.value ?? '';
		const index = caretIndexBeforeTrailingUnit(text);
		// Defer to ensure Ionic has finished applying focus/value updates
		requestAnimationFrame(() => native.setSelectionRange(index, index));
	}

	function caretIndexBeforeTrailingUnit(text: string): number {
		if (!text) return 0;
		// Treat common spaces including NBSP/thin space as whitespace
		let index = text.length - 1;
		// skip trailing whitespace
		while (index >= 0 && isWhitespace(text[index] as string)) index--;
		if (index < 0) return 0;
		const ch = text[index] as string;
		// if last visible char is digit or common separator, keep at absolute end
		if (/[0-9.,'’]/.test(ch)) return text.length;
		// Otherwise, it's a trailing unit/symbol. Move back over any spacing before the symbol
		let index_ = index - 1;
		while (index_ >= 0 && isWhitespace(text[index_] as string)) index_--;
		return index_ + 1; // position right after the last number/separator, before spaces and symbol
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
		// propagate change first
		changed?.(event.detail?.value || '');
		// then ensure caret remains before trailing unit/space
		const native = await element?.getInputElement();
		if (!native) return;
		const fix = (): void => {
			const index = caretIndexBeforeTrailingUnit(native.value ?? '');
			native.setSelectionRange(index, index);
		};
		requestAnimationFrame(() => {
			fix();
			requestAnimationFrame(fix);
		});
	}

	async function onKeyDown(event: KeyboardEvent): Promise<void> {
		if (event.key !== '.' && event.key !== ',') return;
		event.preventDefault();
		if (!element) return;
		const native = await element.getInputElement();
		const current = native.value ?? '';
		const separator = getDecimalSeparator();
		// Avoid adding a second decimal separator
		if (current.includes(separator)) {
			// ensure caret sits before trailing unit
			const index = caretIndexBeforeTrailingUnit(current);
			requestAnimationFrame(() => native.setSelectionRange(index, index));
			return;
		}
		const insertAt = caretIndexBeforeTrailingUnit(current);
		const next = current.slice(0, insertAt) + separator + current.slice(insertAt);
		native.value = next;
		// notify consumer immediately
		changed?.(next);
		// place caret after inserted separator
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

	// Placeholder for undefined or zero values
	const placeholder = $derived(nf.format(0));

	// Displayed value: if undefined or zero, leave empty so placeholder is shown
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
