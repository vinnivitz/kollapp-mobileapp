import { home, cash, person } from 'ionicons/icons';

import { PageRoute, type TabConfig } from '$lib/models/index';
import * as m from '$lib/paraglide/messages';

export const tabs: TabConfig[] = [
	{ label: m.clear_cozy_mantis_drop(), icon: home, tab: PageRoute.HOME },
	{
		label: m.small_full_rat_surge(),
		icon: cash,
		tab: PageRoute.FINANCES
	},
	{ label: m.funny_lucky_jaguar_skip(), icon: person, tab: PageRoute.ACCOUNT }
];
