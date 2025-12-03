import { vi } from 'vitest';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

vi.mock('$app/environment', () => ({
	dev: false
}));

vi.mock('svelte/store', () => {
	type Subscribable<T> = { subscribe?: (run: (value: T) => void) => (() => void) | void } | undefined;
	const get = <T>(store: Subscribable<T>): T | undefined => {
		let current: T | undefined;
		const unsub = store?.subscribe?.((v: T) => {
			current = v;
		});
		if (typeof unsub === 'function') unsub();
		return current;
	};
	return {
		derived: <T>() => ({
			subscribe: vi.fn<(run: (value: T) => void) => () => void>()
		}),
		get,
		readable: <T>() => ({
			subscribe: vi.fn<(run: (value: T) => void) => () => void>()
		}),
		writable: <T>() => ({
			set: vi.fn<(value: T) => void>(),
			subscribe: vi.fn<(run: (value: T) => void) => () => void>()
		})
	};
});

vi.mock('$lib/locales', () => ({
	locale: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return vi.fn();
		}
	},
	t: {
		subscribe: (run: (value: (key: string) => string) => void) => {
			run((key: string) => key);
			return vi.fn();
		}
	}
}));

vi.mock('$lib/stores', () => {
	const g = globalThis as { __mocks?: Record<string, never> };
	const __mocks = (g.__mocks ||= {} as Record<string, never>);

	type DateTimeType = 'date' | 'datetime' | 'time';
	interface DateTimeState {
		open: boolean;
		type: DateTimeType;
		value?: string;
		applied: () => void;
		dismissed: () => void;
		min?: string;
		max?: string;
	}
	const datetimeInputSet = vi.fn<(value: DateTimeState) => void>();
	(__mocks as Record<string, unknown>).datetimeInputSet = datetimeInputSet as unknown as never;
	interface Store<T> {
		subscribe: (run: (value: T) => void) => () => void;
		set: (value: T) => void;
		update: (updater: (value: T) => T) => void;
	}

	const datetimeInputItem: Store<DateTimeState> = {
		set: datetimeInputSet,
		subscribe: (run: (v: DateTimeState) => void) => {
			run({
				applied: vi.fn(),
				dismissed: vi.fn(),
				max: undefined,
				min: undefined,
				open: false,
				type: 'date',
				value: undefined
			});
			return vi.fn();
		},
		update: vi.fn<(updater: (value: DateTimeState) => DateTimeState) => void>()
	};

	return {
		globalPopoverStore: { datetimeInputItem },
		initializationStore: {
			subscribe: (
				run: (v: {
					loadedCache: { subscribe: (r: (v: boolean) => void) => () => void };
					loadedServer: { subscribe: (r: (v: boolean) => void) => () => void };
				}) => void
			) => {
				const readableTrue = {
					subscribe: (r: (v: boolean) => void) => {
						r(true);
						return vi.fn();
					}
				};
				run({ loadedCache: readableTrue, loadedServer: readableTrue });
				return vi.fn();
			}
		},
		localeStore: {
			subscribe: (run: (value: string) => void) => {
				run('de-DE');
				return vi.fn();
			}
		},
		modalStore: {
			add: vi.fn(),
			remove: vi.fn(),
			subscribe: (run: () => void) => {
				run();
				return vi.fn();
			}
		},
		organizationStore: {
			init: vi.fn().mockResolvedValue()
		},
		userStore: {
			init: vi.fn().mockResolvedValue()
		}
	};
});

vi.mock('$app/state', () => ({
	navigating: {
		to: { route: { id: '/' } }
	},
	page: {
		route: { id: '/' },
		subscribe: (run: (v: { route: { id: string } }) => void) => {
			run({ route: { id: '/' } });
			return vi.fn();
		}
	}
}));

vi.mock('$lib/api/services', () => ({
	authenticationService: {
		logout: vi.fn().mockResolvedValue()
	},
	searchableService: {
		filter: vi.fn().mockResolvedValue([])
	}
}));

vi.mock('$lib/utility', () => ({
	clickOutside: () => ({ destroy: () => {} }),
	formatter: {
		currency: (value: number) => `${value}`
	},
	navigateBack: vi.fn().mockResolvedValue(),
	triggerClickByLabel: vi.fn()
}));

if (!globalThis.matchMedia) {
	globalThis.matchMedia = () => ({
		addEventListener: vi.fn(),
		addListener: vi.fn(),
		dispatchEvent: () => false,
		matches: false,
		media: '',
		// eslint-disable-next-line unicorn/no-null
		onchange: null,
		removeEventListener: vi.fn(),
		removeListener: vi.fn()
	});
}

vi.mock('@ionic/core', () => ({
	getPlatforms: () => ['desktop'],
	modalController: {
		getTop: vi.fn().mockResolvedValue(vi.fn())
	}
}));

if (typeof HTMLElement !== 'undefined') {
	class MockIonModal extends HTMLElement {
		dismiss = vi.fn().mockResolvedValue(true);
		setCurrentBreakpoint = vi.fn();
	}
	customElements.define('ion-modal', MockIonModal);

	class MockIonInput extends HTMLElement {
		value = '';
		getInputElement = vi.fn().mockResolvedValue({
			dispatchEvent: vi.fn(),
			focus: vi.fn(),
			setSelectionRange: vi.fn(),
			style: {},
			value: ''
		});
	}
	customElements.define('ion-input', MockIonInput);

	class MockIonFab extends HTMLElement {}
	customElements.define('ion-fab', MockIonFab);

	class MockIonText extends HTMLElement {}
	customElements.define('ion-text', MockIonText);

	class MockIonNote extends HTMLElement {}
	customElements.define('ion-note', MockIonNote);

	class MockIonCard extends HTMLElement {}
	customElements.define('ion-card', MockIonCard);

	class MockIonChip extends HTMLElement {}
	customElements.define('ion-chip', MockIonChip);

	class MockIonIcon extends HTMLElement {}
	customElements.define('ion-icon', MockIonIcon);

	class MockIonMenu extends HTMLElement {
		close = vi.fn().mockResolvedValue(true);
	}
	customElements.define('ion-menu', MockIonMenu);

	class MockIonRefresher extends HTMLElement {
		complete = vi.fn();
	}
	customElements.define('ion-refresher', MockIonRefresher);

	class MockIonTabs extends HTMLElement {
		select = vi.fn();
	}
	customElements.define('ion-tabs', MockIonTabs);

	class MockIonItem extends HTMLElement {}
	customElements.define('ion-item', MockIonItem);

	class MockIonItemSliding extends HTMLElement {
		open = vi.fn();
		close = vi.fn();
	}
	customElements.define('ion-item-sliding', MockIonItemSliding);

	class MockIonItemOptions extends HTMLElement {}
	customElements.define('ion-item-options', MockIonItemOptions);

	class MockIonItemOption extends HTMLElement {}
	customElements.define('ion-item-option', MockIonItemOption);

	class MockIonPopover extends HTMLElement {}
	customElements.define('ion-popover', MockIonPopover);

	class MockIonDatetime extends HTMLElement {}
	customElements.define('ion-datetime', MockIonDatetime);

	class MockIonTitle extends HTMLElement {}
	customElements.define('ion-title', MockIonTitle);

	class MockIonToolbar extends HTMLElement {}
	customElements.define('ion-toolbar', MockIonToolbar);

	class MockIonHeader extends HTMLElement {}
	customElements.define('ion-header', MockIonHeader);

	class MockIonButtons extends HTMLElement {}
	customElements.define('ion-buttons', MockIonButtons);

	class MockIonBackButton extends HTMLElement {}
	customElements.define('ion-back-button', MockIonBackButton);

	class MockIonButton extends HTMLElement {}
	customElements.define('ion-button', MockIonButton);

	class MockIonLabel extends HTMLElement {}
	customElements.define('ion-label', MockIonLabel);

	class MockIonTextarea extends HTMLElement {}
	customElements.define('ion-textarea', MockIonTextarea);

	class MockIonList extends HTMLElement {}
	customElements.define('ion-list', MockIonList);

	class MockIonCheckbox extends HTMLElement {}
	customElements.define('ion-checkbox', MockIonCheckbox);

	class MockIonRadioGroup extends HTMLElement {}
	customElements.define('ion-radio-group', MockIonRadioGroup);

	class MockIonRadio extends HTMLElement {}
	customElements.define('ion-radio', MockIonRadio);

	class MockIonSearchbar extends HTMLElement {
		setFocus = vi.fn();
	}
	customElements.define('ion-searchbar', MockIonSearchbar);

	class MockIonFabButton extends HTMLElement {}
	customElements.define('ion-fab-button', MockIonFabButton);

	class MockIonFabList extends HTMLElement {}
	customElements.define('ion-fab-list', MockIonFabList);

	class MockIonCardHeader extends HTMLElement {}
	customElements.define('ion-card-header', MockIonCardHeader);

	class MockIonCardTitle extends HTMLElement {}
	customElements.define('ion-card-title', MockIonCardTitle);

	class MockIonCardContent extends HTMLElement {}
	customElements.define('ion-card-content', MockIonCardContent);

	class MockIonCardSubtitle extends HTMLElement {}
	customElements.define('ion-card-subtitle', MockIonCardSubtitle);

	class MockIonBadge extends HTMLElement {}
	customElements.define('ion-badge', MockIonBadge);
}

if (
	typeof Element !== 'undefined' &&
	!(Element.prototype as { animate?: (...arguments_: never[]) => unknown }).animate
) {
	const proto = Element.prototype as {
		animate?: (...arguments_: never[]) => {
			onfinish: (() => void) | null;
			addEventListener: (...arguments__: never[]) => void;
			cancel: () => void;
			removeEventListener: (...arguments_: never[]) => void;
		};
	};
	proto.animate = vi.fn().mockImplementation(() => {
		const animation = {
			addEventListener: vi.fn(),
			cancel: vi.fn(),
			onfinish: vi.fn(),
			removeEventListener: vi.fn()
		};
		setTimeout(() => {
			if (animation.onfinish) animation.onfinish();
		}, 0);
		return animation;
	});
}
