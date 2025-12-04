import { type IonicConfig } from '@ionic/core';
import { initialize } from '@ionic/core/components';

export function initializeIonic(config?: IonicConfig): void {
	initialize(config);

	if (typeof document !== 'undefined') {
		document.documentElement.classList.add('ion-ce');
	}
}
