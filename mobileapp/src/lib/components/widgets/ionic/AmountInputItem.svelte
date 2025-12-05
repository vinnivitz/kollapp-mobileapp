<script lang="ts">
	import type { Locale } from '$lib/locales';
	import type { InputInputEventDetail } from '@ionic/core';

	import { cashOutline } from 'ionicons/icons';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import { type Colors, Currency, type NumberStyle } from '$lib/models/ui';
	import { localeStore } from '$lib/stores';

	type AmountPhase = 'fractal' | 'int' | 'zero';

	type AmountTokenRole = 'currency' | 'decimalseparation' | 'fracal' | 'group' | 'int' | 'space';

	type AmountToken = {
		role: AmountTokenRole;
		text: string;
		grey?: boolean;
	};

	type AmountEditState = {
		cents: number;
		phase: AmountPhase;
		typedFractalDigits: FractalDigit;
	};

	type AmountFormatState = {
		cents: number;
		phase: AmountPhase;
		typedFractalDigits: FractalDigit;
		currency?: Currency;
		locale?: Locale;
	};

	type FractalDigit = 0 | 1 | 2;

	type LocaleBehavior = {
		currencyFirst: boolean;
		decimal: string;
		group: string;
		thinNbspBetweenNumberAndCurrency: boolean;
	};

	type LocaleSeparators = {
		decimal: string;
	};

	type Properties = {
		label: string;
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
		inputElement?: (element: HTMLIonInputElement) => void;
		inputIconClicked?: () => void;
	} & (
		| { name: string; changed?: never; value?: never }
		| { value: number; name?: never; changed?: (value: number) => void }
	);

	let {
		card,
		changed,
		classList = '',
		color,
		currency = Currency.EUR,
		disabled,
		helperText,
		icon = cashOutline,
		inputElement,
		inputIcon,
		inputIconClicked,
		label,
		name,
		readonly,
		value
	}: Properties = $props();

	const MAX_TOTAL_DIGITS = 9;
	const MAX_INT_DIGITS = 7;

	let element = $state<HTMLIonInputElement>();
	let containerElement = $state<HTMLDivElement>();

	function notifyChange(cents: number, native?: HTMLInputElement): void {
		if (name && containerElement) {
			containerElement.dispatchEvent(
				new CustomEvent('customChange', {
					bubbles: true,
					detail: { key: name, value: cents }
				})
			);
		} else {
			changed?.(cents);
			if (native) {
				native.dispatchEvent(new Event('input', { bubbles: true }));
			}
		}
	}

	let edit = $state<AmountEditState>(createStateFromCents(value ?? 0));
	let tokens = $derived(
		formatAmountTokens({
			cents: edit.cents,
			currency,
			locale: get(localeStore),
			phase: edit.phase,
			typedFractalDigits: edit.typedFractalDigits
		})
	);
	let plain = $derived(tokensToPlainString(tokens));

	$effect(() => {
		if (element) inputElement?.(element);
	});

	$effect(() => {
		if (value && element) {
			element.getInputElement().then((native) => {
				if (native) {
					edit = createStateFromCents(value);
					native.value = plain;
					native.dispatchEvent(new Event('input', { bubbles: true }));
				}
			});
		}
	});

	function clampCents(value: number): number {
		if (value < 0) return 0;
		return value;
	}

	function createStateFromCents(cents: number): AmountEditState {
		const c = clampCents(Math.trunc(cents || 0));
		if (c === 0) return { cents: 0, phase: 'zero', typedFractalDigits: 0 };
		return { cents: c, phase: 'int', typedFractalDigits: 0 };
	}

	function onDigit(state: AmountEditState, digitCharacter: string): AmountEditState {
		const difference = digitCharacter.codePointAt(0)! - 48;
		if (difference < 0 || difference > 9) return state;
		const euros = Math.floor(state.cents / 100);
		const frac = state.cents % 100;
		const intDigits = euros === 0 ? 0 : euros.toString().length;

		if (state.phase === 'zero' || state.phase === 'int') {
			if (intDigits >= MAX_INT_DIGITS) return state;
			const newEuros = euros * 10 + difference;
			const next = newEuros * 100 + frac;
			return { cents: next, phase: 'int', typedFractalDigits: 0 };
		}

		if (state.typedFractalDigits === 0) {
			if (intDigits + 1 > MAX_TOTAL_DIGITS) return state;
			const next = euros * 100 + (difference * 10 + 0);
			return { cents: next, phase: 'fractal', typedFractalDigits: 1 };
		} else if (state.typedFractalDigits === 1) {
			if (intDigits + 2 > MAX_TOTAL_DIGITS) return state;
			const first = Math.floor(frac / 10);
			const next = euros * 100 + (first * 10 + difference);
			return { cents: next, phase: 'fractal', typedFractalDigits: 2 };
		}

		return state;
	}

	function onSeparator(state: AmountEditState): AmountEditState {
		if (state.phase === 'fractal') return state;
		const euros = Math.floor(state.cents / 100);
		return { cents: euros * 100, phase: 'fractal', typedFractalDigits: 0 };
	}

	function onBackspace(state: AmountEditState): AmountEditState {
		const euros = Math.floor(state.cents / 100);
		const frac = state.cents % 100;

		if (state.phase === 'fractal') {
			if (state.typedFractalDigits > 0) {
				if (state.typedFractalDigits === 1) {
					const second = frac % 10;
					const next = euros * 100 + (0 * 10 + second);
					return { cents: next, phase: 'fractal', typedFractalDigits: 0 };
				} else {
					const first = Math.floor(frac / 10);
					const next = euros * 100 + (first * 10 + 0);
					return { cents: next, phase: 'fractal', typedFractalDigits: 1 };
				}
			}
			const newEuros = Math.floor(euros / 10);
			const next = newEuros * 100 + frac;
			if (next === 0) return { cents: 0, phase: 'zero', typedFractalDigits: 0 };
			return { cents: next, phase: 'int', typedFractalDigits: 0 };
		}

		const newEuros = Math.floor(euros / 10);
		const next = newEuros * 100 + frac;
		if (next === 0) return { cents: 0, phase: 'zero', typedFractalDigits: 0 };
		return { cents: next, phase: 'int', typedFractalDigits: 0 };
	}

	function onPasteToState(text: string): AmountEditState {
		const normalized = text
			.replaceAll(/[^0-9.,]/g, '')
			.replaceAll(',', '.')
			.trim();

		let eurosString = normalized;
		let fractalString = '';

		const decimalIndex = normalized.lastIndexOf('.');

		if (decimalIndex !== -1) {
			const fractalCandidate = normalized.slice(decimalIndex + 1);
			const fracDigitsCandidate = fractalCandidate.replaceAll(/\D/g, '');

			if (fracDigitsCandidate.length <= 2) {
				eurosString = normalized.slice(0, decimalIndex);
				fractalString = fractalCandidate;
			}
		}

		let eurosDigits = eurosString.replaceAll(/\D/g, '');
		let fracDigits = fractalString.replaceAll(/\D/g, '').slice(0, 2);

		if (eurosDigits.length > MAX_INT_DIGITS) {
			eurosDigits = eurosDigits.slice(0, MAX_INT_DIGITS);
			fracDigits = '';
		} else if (eurosDigits.length + fracDigits.length > MAX_TOTAL_DIGITS) {
			const allowedFrac = Math.max(0, Math.min(2, MAX_TOTAL_DIGITS - eurosDigits.length));
			fracDigits = fracDigits.slice(0, allowedFrac);
		}

		const euros = eurosDigits.length > 0 ? Number.parseInt(eurosDigits, 10) : 0;
		const frac = fracDigits.length > 0 ? Number.parseInt(fracDigits.padEnd(2, '0'), 10) : 0;
		const cents = euros * 100 + frac;
		const typed = Math.min(2, fracDigits.length) as FractalDigit;

		if (cents === 0) return { cents, phase: 'zero', typedFractalDigits: 0 };
		return { cents, phase: typed > 0 ? 'fractal' : 'int', typedFractalDigits: typed };
	}

	function getLocaleSeparators(locale: string): LocaleSeparators {
		const parts = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, style: 'decimal' }).formatToParts(1.1);
		const decimal = parts.find((p) => p.type === 'decimal')?.value ?? (locale.startsWith('de') ? ',' : '.');
		return { decimal };
	}

	function detectLocaleBehavior(locale: string, current: Currency): LocaleBehavior {
		const deStyle = /^de(-|$)/i.test(locale);
		const parts = new Intl.NumberFormat(locale, { currency: current, style: 'currency' }).formatToParts(1_234_567.5);
		const decimal = parts.find((p) => p.type === 'decimal')?.value ?? (deStyle ? ',' : '.');
		const group = parts.find((p) => p.type === 'group')?.value ?? (deStyle ? '.' : ',');
		const currencyFirst = parts[0]?.type === 'currency';
		return { currencyFirst, decimal, group, thinNbspBetweenNumberAndCurrency: deStyle };
	}

	function formatIntegerWithGrouping(intValue: number, groupSeparator: string): string {
		const stringValue = Math.trunc(intValue).toString();
		const out: string[] = [];
		let count = 0;
		for (let index = stringValue.length - 1; index >= 0; index--) {
			out.push(stringValue[index] as string);
			count++;
			if (count === 3 && index !== 0) {
				out.push(groupSeparator);
				count = 0;
			}
		}
		return out.toReversed().join('');
	}

	// eslint-disable-next-line sonarjs/cognitive-complexity
	function formatAmountTokens(state: AmountFormatState): AmountToken[] {
		const localeString = (state.locale ?? get(localeStore)) as string;
		const currency = state.currency ?? Currency.EUR;
		const { currencyFirst, decimal, group, thinNbspBetweenNumberAndCurrency } = detectLocaleBehavior(
			localeString,
			currency
		);

		const euros = Math.floor((state.cents ?? 0) / 100);
		const fractalValue = Math.abs(state.cents ?? 0) % 100;

		const intString = formatIntegerWithGrouping(euros, group);
		const fractalString = fractalValue.toString().padStart(2, '0');

		const numberTokens: AmountToken[] = [];
		if (intString.length > 0) {
			for (const character of intString) {
				if (character === group) numberTokens.push({ role: 'group', text: character });
				else numberTokens.push({ role: 'int', text: character });
			}
		} else {
			numberTokens.push({ role: 'int', text: '0' });
		}

		numberTokens.push({ role: 'decimalseparation', text: decimal });

		const fractalCharacters = [fractalString[0] as string, fractalString[1] as string];
		const greyAllNumeric = state.phase === 'zero';
		const greyDecimalOnly = state.phase === 'int';
		const fractalTyped = state.phase === 'fractal' ? state.typedFractalDigits : 0;

		for (let index = 0; index < 2; index++) {
			const grey = greyAllNumeric || (greyDecimalOnly ? true : index >= fractalTyped);
			numberTokens.push({ grey, role: 'fracal', text: fractalCharacters[index] as string });
		}

		if (greyAllNumeric) {
			for (const token of numberTokens) {
				if (token.role === 'int' || token.role === 'group' || token.role === 'decimalseparation') token.grey = true;
			}
		} else if (greyDecimalOnly) {
			for (const token of numberTokens) {
				if (token.role === 'decimalseparation') token.grey = true;
			}
		}

		const tokens: AmountToken[] = [];
		const currencyToken: AmountToken = {
			role: 'currency',
			text:
				new Intl.NumberFormat(localeString, { currency: currency, style: 'currency' })
					.formatToParts(0)
					.find((p) => p.type === 'currency')?.value ?? '€'
		};

		if (currencyFirst) {
			tokens.push(currencyToken, ...numberTokens);
		} else {
			tokens.push(...numberTokens);
			if (thinNbspBetweenNumberAndCurrency) tokens.push({ role: 'space', text: '\u202F' });
			tokens.push(currencyToken);
		}

		return tokens;
	}

	function tokensToPlainString(tokens: AmountToken[]): string {
		return tokens.map((token) => token.text).join('');
	}

	let intervalId: ReturnType<typeof setInterval> | undefined;

	onMount(async () => {
		const native = await element?.getInputElement();
		if (native) {
			applyNativeMaskStyles(native);

			if (native.value && native.value !== plain) {
				edit =
					native.value === '' || native.value.replaceAll(/\D/g, '').length === 0
						? createStateFromCents(0)
						: onPasteToState(native.value);
			}
		}

		intervalId = setInterval(async () => {
			const native = await element?.getInputElement();
			if (native && native.value !== plain) {
				const parsedState = onPasteToState(native.value);
				if (parsedState.cents !== edit.cents) {
					edit = parsedState;
					notifyChange(edit.cents);
				}
			}
		}, 100);
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	function getDecimalSeparator(): string {
		return getLocaleSeparators(get(localeStore) ?? 'de').decimal;
	}

	function isDecimalKey(event: KeyboardEvent, dec: string): boolean {
		if (event.key === dec) return true;
		if (dec === ',' && event.key === '.') return true;
		if (dec === '.' && event.key === ',') return true;
		if (event.code === 'NumpadDecimal') return true;
		if (event.key === 'Decimal' || event.key === 'Separator') return true;
		return false;
	}

	async function onIonInput(_event: CustomEvent<InputInputEventDetail>): Promise<void> {
		const native = (await element?.getInputElement()) as HTMLInputElement;
		if (!native) return;
		applyNativeMaskStyles(native);

		if (handleInsertText(_event, native)) return;
		if (handleValueMatch(native)) return;
		handleValueMismatch(native);
	}

	function handleInsertText(event: CustomEvent<InputInputEventDetail>, native: HTMLInputElement): boolean {
		const inputEvent = event.detail.event as InputEvent | undefined;
		if (!inputEvent || (inputEvent.inputType !== 'insertText' && inputEvent.inputType !== 'deleteContentBackward')) {
			return false;
		}

		if (inputEvent.inputType === 'insertText' && inputEvent.data) {
			const dec = getDecimalSeparator();
			if (inputEvent.data === '.' || inputEvent.data === ',' || inputEvent.data === dec) {
				edit = onSeparator(edit);
				native.value = plain;
				native.dispatchEvent(new Event('input', { bubbles: true }));
				setCaretScripted(native);
				return true;
			}
		}

		setCaretScripted(native);
		return true;
	}

	function handleValueMatch(native: HTMLInputElement): boolean {
		if (native.value !== plain) return false;
		setCaretScripted(native);
		return true;
	}

	function handleValueMismatch(native: HTMLInputElement): void {
		if (native.value === undefined) return;
		const digitsOnly = native.value.replaceAll(/\D/g, '');

		if (digitsOnly.length === 0) {
			if (edit.cents !== 0) {
				edit = createStateFromCents(0);
			}
		} else {
			const parsedState = onPasteToState(native.value);
			if (parsedState.cents === edit.cents) {
				forceNativeValue(native);
				return;
			}
			edit = parsedState;
		}

		setCaretScripted(native);
	}

	function forceNativeValue(native: HTMLInputElement): void {
		const targetValue = plain;
		native.value = targetValue;
		setTimeout(() => {
			native.value = targetValue;
			setCaretScripted(native);
		}, 10);
	}

	async function onKeyDown(event: KeyboardEvent): Promise<void> {
		const dec = getDecimalSeparator();
		const native = (await element?.getInputElement()) as HTMLInputElement;
		if (!native) return;
		applyNativeMaskStyles(native);
		const isDigit = event.key.length === 1 && event.key >= '0' && event.key <= '9';
		if (isDigit) {
			event.preventDefault();
			edit = onDigit(edit, event.key);
			native.value = plain;
			notifyChange(edit.cents, native);
			setTimeout(() => setCaretScripted(native), 0);
			return;
		}
		if (isDecimalKey(event, dec)) {
			event.preventDefault();
			edit = onSeparator(edit);
			native.value = plain;
			setCaretScripted(native);
			return;
		}
		if (event.key === 'Backspace') {
			event.preventDefault();
			edit = onBackspace(edit);
			native.value = plain;
			notifyChange(edit.cents, native);
			setCaretScripted(native);
			return;
		}

		const isPrintable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
		if (isPrintable) {
			return event.preventDefault();
		}

		if (event.key.startsWith('Arrow') || event.key === 'Delete') {
			return event.preventDefault();
		}
	}

	async function onPaste(event: ClipboardEvent): Promise<void> {
		const text = event.clipboardData?.getData('text') ?? '';
		if (!text) return;
		event.preventDefault();
		edit = onPasteToState(text);
		const native = (await element?.getInputElement()) as HTMLInputElement;
		if (native) {
			applyNativeMaskStyles(native);
			native.value = plain;
			setCaretScripted(native);
			notifyChange(edit.cents, native);
		}
	}

	function applyNativeMaskStyles(native: HTMLInputElement): void {
		if (!native.style) return;
		native.style.color = 'transparent';
		native.style.webkitTextFillColor = 'transparent';
		native.style.textShadow = 'none';
		native.style.caretColor = 'var(--ion-color-secondary)';
	}

	function setCaretScripted(native: HTMLInputElement): void {
		const txt = plain;
		const currencyFirst = tokens[0]?.role === 'currency';
		let index = 0;
		if (edit.phase === 'zero') {
			index = currencyFirst ? (tokens[0]?.text.length ?? 0) : 0;
		} else {
			const dec = getDecimalSeparator();
			const separatorIndex = txt.indexOf(dec);
			index = edit.phase === 'int' ? separatorIndex : separatorIndex + 1 + edit.typedFractalDigits;
		}
		requestAnimationFrame(() => native.setSelectionRange(index, index));
	}
</script>

<div bind:this={containerElement}>
	<CustomItem {card} {color} {icon} iconEnd={inputIcon} iconClick={inputIconClicked} {classList}>
		<div class="relative">
			<div class="ghost absolute inset-0 top-7 flex items-center" aria-hidden="true">
				{#each tokens as token (token)}
					<span class:grey={token.grey}>{token.text}</span>
				{/each}
			</div>
			<ion-input
				bind:this={element}
				{readonly}
				label-placement="floating"
				{name}
				{label}
				type="text"
				pattern="[0-9.,]*"
				inputmode="decimal"
				{disabled}
				helper-text={helperText}
				value={plain}
				onfocus={async () => {
					const inputElement = await element?.getInputElement();
					if (inputElement) setCaretScripted(inputElement);
				}}
				onionFocus={async () => {
					const inputElement = await element?.getInputElement();
					if (inputElement) setCaretScripted(inputElement);
				}}
				onclick={async () => {
					const inputElement = await element?.getInputElement();
					if (inputElement) setCaretScripted(inputElement);
				}}
				onkeydown={onKeyDown}
				onpaste={onPaste}
				onionInput={onIonInput}
				role="menuitem"
				tabindex="0"
			>
			</ion-input>
		</div>
	</CustomItem>
</div>

<style>
	ion-input {
		--highlight-color-focused: var(--ion-color-secondary);
		--color: var(--ion-color-dark);
	}

	.grey {
		color: var(--ion-color-medium);
	}

	ion-input::part(native),
	ion-input::part(input),
	ion-input::part(native-input),
	ion-input::part(textarea) {
		color: transparent !important;
		-webkit-text-fill-color: transparent;
		text-shadow: none !important;
		caret-color: var(--ion-color-secondary);
	}
</style>
