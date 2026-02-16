<script lang="ts">
	import type { PageData } from './$types';
	import type { ActivityUpdateRequestTO } from '@kollapp/api-types';

	import { AppLauncher } from '@capacitor/app-launcher';
	import { TZDate } from '@date-fns/tz';
	import { CapacitorCalendar } from '@ebarooni/capacitor-calendar';
	import { isPlatform } from '@ionic/core';
	import { addDays, formatDistanceToNow } from 'date-fns';
	import {
		addOutline,
		calendarClearOutline,
		createOutline,
		documentOutline,
		locationOutline,
		mapOutline,
		trashOutline
	} from 'ionicons/icons';

	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { updateActivitySchema } from '$lib/api/schemas/organization';
	import { activityService, budgetService } from '$lib/api/services';
	import {
		Button,
		Card,
		DatetimeInputItem,
		FabButton,
		InputItem,
		LocationInputItem,
		Modal
	} from '$lib/components/core';
	import { Layout } from '$lib/components/layout';
	import { BudgetOverview } from '$lib/components/shared';
	import { t } from '$lib/locales';
	import { type FabButtonButtons, Form, type FormActions } from '$lib/models/ui';
	import { localeStore, organizationStore } from '$lib/stores';
	import {
		clone,
		confirmationModal,
		customForm,
		getDateFnsLocale,
		hasOrganizationRole,
		promptCalendarPermissionRequest,
		withLoader
	} from '$lib/utility';

	const { data }: { data: PageData } = $props();

	const activity = $derived($organizationStore?.activities.find((activity) => activity.id === data.activityId));
	const postings = $derived(
		(activity?.activityPostings ?? []).toSorted((a, b) => {
			return new TZDate(b.date).getTime() - new TZDate(a.date).getTime();
		})
	);

	const isManager = $derived(hasOrganizationRole('ROLE_ORGANIZATION_MANAGER'));

	const activityEventButtons: FabButtonButtons[] = [
		{
			color: 'danger',
			handler: onDeleteActivity,
			icon: trashOutline,
			label: $t('routes.organization.activities.slug.page.fab.delete')
		},
		{
			color: 'primary',
			handler: onOpenActivityModal,
			icon: createOutline,
			label: $t('routes.organization.activities.slug.page.fab.edit')
		}
	];

	let updateActivityFormActions: FormActions<ActivityUpdateRequestTO>;

	let updateActivityModalOpen = $state<boolean>(false);

	let updateActivityModelTouched = $state<boolean>(false);

	const updateActivityForm = new Form({
		actions: (actions) => (updateActivityFormActions = actions),
		completed: async () => {
			updateActivityModalOpen = false;
			updateActivityModelTouched = false;
		},
		failed: () => {
			updateActivityModelTouched = false;
			updateActivityModalOpen = false;
		},
		onTouched: () => (updateActivityModelTouched = true),
		request: async (model) => await activityService.update(activity?.id!, model),
		schema: updateActivitySchema()
	});

	$effect(() => {
		if ($organizationStore && !activity) goto(resolve('/organization/activities'));
	});

	async function onDeleteActivity(): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.organization.activities.slug.page.modal.delete-activity.confirm'),
			handler: deleteActivity
		});
	}

	async function deleteActivity(): Promise<void> {
		await withLoader(async () => {
			await activityService.remove(activity?.id!);
			updateActivityModalOpen = false;
		});
		await goto(resolve('/organization/activities'));
	}

	function onOpenActivityModal(): void {
		updateActivityFormActions.set(clone(activity));
		updateActivityModalOpen = true;
	}

	async function onOpenLocation(_event?: MouseEvent): Promise<void> {
		_event?.stopPropagation();
		const url = isPlatform('ios')
			? `maps://?q=${encodeURIComponent(activity?.location ?? '')}`
			: `geo:0,0?q=${encodeURIComponent(activity?.location ?? '')}`;
		await AppLauncher.openUrl({ url });
	}

	async function onAddToCalendar(_event?: MouseEvent): Promise<void> {
		_event?.stopPropagation();
		if (!(await promptCalendarPermissionRequest()) || !activity) return;
		await CapacitorCalendar.createEventWithPrompt({
			alerts: [30],
			endDate: addDays(Date.now(), 1).getTime(),
			isAllDay: false,
			location: activity.location,
			startDate: Date.now(),
			title: activity.name,
			url: `kollapp://activities/${activity.id}`
		});
	}
</script>

<Layout title={$t('routes.organization.activities.slug.page.title')} showBackButton loading={!activity}>
	{@render activitySummary()}
	{@render postingsSummary()}
	{#if isManager}
		<FabButton
			indexLabel={$t('routes.organization.activities.slug.page.action-button')}
			icon={addOutline}
			buttons={activityEventButtons}
		/>
	{/if}
</Layout>

<!-- Snippets -->

{#snippet activitySummary()}
	<Card border="primary" title={activity?.name} classList="mb-5">
		<div class="flex flex-wrap items-center justify-center gap-3">
			<div class="flex items-center gap-1">
				<ion-icon icon={locationOutline}></ion-icon>
				<ion-text>{activity?.location}</ion-text>
			</div>
			<div class="flex items-center gap-1">
				<ion-icon icon={calendarClearOutline}></ion-icon>
				<ion-text>
					{formatDistanceToNow(new TZDate(activity?.date!), {
						addSuffix: true,
						locale: getDateFnsLocale($localeStore)
					})}
				</ion-text>
			</div>
		</div>
		<div class="mt-2 flex items-center justify-center gap-2">
			<Button
				icon={mapOutline}
				size="small"
				fill="solid"
				color="light"
				label={$t('routes.organization.activities.slug.page.activity-summary.open-in-map')}
				clicked={onOpenLocation}
			/>
			<Button
				icon={calendarClearOutline}
				size="small"
				fill="solid"
				color="light"
				label={$t('routes.organization.activities.slug.page.activity-summary.add-to-calendar')}
				clicked={onAddToCalendar}
			/>
		</div>
	</Card>
{/snippet}

{#snippet postingsSummary()}
	<BudgetOverview
		{activity}
		activities={$organizationStore?.activities!}
		budgetCategories={$organizationStore?.budgetCategories!}
		personsOfOrganization={$organizationStore?.personsOfOrganization!}
		{postings}
		title={$t('routes.organization.activities.slug.page.postings-summary.card.title')}
		onCreateOrganizationPosting={budgetService.createOrganizationPosting}
		onCreateActivityPosting={budgetService.createActivityPosting}
		onUpdateOrganizationPosting={budgetService.updateOrganizationPosting}
		onUpdateActivityPosting={budgetService.updateActivityPosting}
		onDeleteOrganizationPosting={budgetService.deleteOrganizationPosting}
		onDeleteActivityPosting={budgetService.deleteActivityPosting}
		onTransferOrganizationPosting={budgetService.transferOrganizationPosting}
		onTransferActivityPosting={budgetService.transferActivityPosting}
		onOpenStatistics={async () => goto(resolve(`/organization/activities/${activity?.id}/statistics`))}
	/>
{/snippet}

<!-- Modals -->

<!-- Update Activity Modal -->
<Modal
	dismissed={() => (updateActivityModalOpen = false)}
	touched={updateActivityModelTouched}
	open={updateActivityModalOpen}
	confirmLabel={$t('routes.organization.activities.slug.page.modal.update-activity.confirm')}
>
	<Card title={$t('routes.organization.activities.slug.page.modal.update-activity.card.title')}>
		<form use:customForm={updateActivityForm}>
			<InputItem
				name="name"
				label={$t('routes.organization.activities.slug.page.modal.update-activity.card.form.name')}
				icon={documentOutline}
			/>
			<LocationInputItem
				label={$t('routes.organization.activities.slug.page.modal.update-activity.card.form.location')}
				name="location"
			/>
			<DatetimeInputItem
				label={$t('routes.organization.activities.slug.page.modal.update-activity.card.form.date')}
				name="date"
			/>
		</form>
	</Card>
</Modal>
