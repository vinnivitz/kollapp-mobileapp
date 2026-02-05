<script lang="ts">
	import type { OrganizationTO } from '@kollapp/api-types';

	import { arrowForwardOutline, cashOutline, flashOutline, peopleOutline } from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import IconLabel from '../../ionic/IconLabel.svelte';

	import { Card } from '$lib/components/widgets/ionic';
	import { t } from '$lib/locales';
	import { TourStepId } from '$lib/models/ui';
	import { organizationStore } from '$lib/stores';

	type Properties = {
		editMode: boolean;
		organization?: OrganizationTO;
	};

	let { editMode, organization }: Properties = $props();
</script>

<Card
	titleIconStart={peopleOutline}
	border="primary"
	title={organization?.name}
	clicked={editMode ? undefined : () => goto(resolve('/organization'))}
	titleIconEnd={editMode ? undefined : arrowForwardOutline}
	tourId={TourStepId.HOME.ORGANIZATION}
	readonly={editMode}
>
	<ion-note class="flex flex-wrap items-center justify-center gap-3 text-sm">
		<IconLabel
			icon={peopleOutline}
			label={$t('routes.page.page.organization-card.card.members', {
				value: organization?.personsOfOrganization.length
			})}
		/>
		<IconLabel
			icon={flashOutline}
			label={$t('routes.page.page.organization-card.card.activities', {
				value: $organizationStore?.activities.length ?? 0
			})}
		/>
		<IconLabel
			icon={cashOutline}
			label={$t('routes.page.page.organization-card.card.postings', {
				value:
					($organizationStore?.organizationPostings.length ?? 0) +
					($organizationStore?.activities.reduce((total, act) => total + act.activityPostings.length, 0) ?? 0)
			})}
		/>
	</ion-note>
</Card>
