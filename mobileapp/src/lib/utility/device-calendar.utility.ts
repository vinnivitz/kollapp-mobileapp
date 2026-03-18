import { CalendarPermissionScope, CapacitorCalendar } from '@ebarooni/capacitor-calendar';
import { get } from 'svelte/store';

import { showAlert } from './alert.utility';

import { t } from '$lib/locales';

/**
 * Prompts the user for calendar permission request
 * @returns {Promise<boolean>} true if permission granted, false otherwise
 */
export async function promptCalendarPermissionRequest(): Promise<boolean> {
	const $t = get(t);
	try {
		let permission = await CapacitorCalendar.checkPermission({ scope: CalendarPermissionScope.WRITE_CALENDAR });
		if (permission.result === 'granted') {
			return true;
		} else if (
			permission.result === 'prompt' ||
			permission.result === 'denied' ||
			permission.result === 'prompt-with-rationale'
		) {
			permission = await CapacitorCalendar.requestFullCalendarAccess();
			if (permission.result === 'granted') {
				return true;
			}
		}
		await showAlert($t('routes.organization.activities.slug.page.calendar-request-prompt.denied'));
		return false;
	} catch {
		await showAlert($t('routes.organization.activities.slug.page.calendar-request-prompt.error'));
		return false;
	}
}
