<script lang="ts">
	import type { OrganizationRole, PersonOfOrganizationTO } from '@kollapp/api-types';

	import { Clipboard } from '@capacitor/clipboard';
	import { Share } from '@capacitor/share';
	import { TZDate } from '@date-fns/tz';
	import { actionSheetController } from '@ionic/core';
	import QRCode from '@svelte-put/qr/svg/QR.svelte';
	import { EmailComposer } from 'capacitor-email-composer';
	import { formatDistanceToNow } from 'date-fns';
	import {
		accessibilityOutline,
		checkmarkOutline,
		clipboardOutline,
		logOutOutline,
		mailOutline,
		medalOutline,
		personAddOutline,
		personCircleOutline,
		personOutline,
		qrCode,
		qrCodeOutline,
		refreshCircleOutline,
		ribbonOutline,
		shareOutline,
		trashOutline
	} from 'ionicons/icons';
	import { SvelteMap } from 'svelte/reactivity';

	import { dev } from '$app/environment';

	import { organizationService } from '$lib/api/services';
	import FadeInOut from '$lib/components/layout/FadeInOut.svelte';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import environment from '$lib/environment';
	import { t } from '$lib/locales';
	import { AlertType, type ItemSlidingOption } from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import {
		confirmationModal,
		getDateFnsLocale,
		getRoleTranslationFromRole,
		hasOrganizationRole,
		showAlert,
		StatusCheck
	} from '$lib/utility';

	let invitationCodeModalOpen = $state<boolean>(false);
	let qrModalOpen = $state<boolean>(false);

	const userId = $derived($userStore?.id);

	const invitationCodeExpiration = $derived(
		new TZDate($organizationStore?.organizationInvitationCode.expirationDate ?? '')
	);
	const invitationCode = $derived($organizationStore?.organizationInvitationCode.code ?? '');

	const members = $derived(
		($organizationStore?.personsOfOrganization ?? [])
			.toSorted((a, b) => a.username.localeCompare(b.username))
			.filter((member) => member.userId !== userId && member.status === 'APPROVED')
	);

	const pendingMembers = $derived(members.filter((member) => member.status === 'PENDING'));

	const memberGroups = $derived(getGroupedMembers(members));

	const isExpired = $derived(invitationCodeExpiration.getTime() <= Date.now());

	function getMemberSlidingOptions(member: PersonOfOrganizationTO): ItemSlidingOption[] {
		return [
			{ color: 'tertiary', handler: () => onSelectRole(member), icon: ribbonOutline },
			{ color: 'danger', handler: () => onRemoveUserPrompt(member.id), icon: logOutOutline }
		];
	}

	function getPendingMemberSlidingOptions(member: PersonOfOrganizationTO): ItemSlidingOption[] {
		return [
			{ color: 'success', handler: () => onApproveMemberPrompt(member.id), icon: checkmarkOutline },
			{ color: 'danger', handler: () => onRemoveUserPrompt(member.id), icon: trashOutline }
		];
	}

	async function onApproveMemberPrompt(memberId: number): Promise<void> {
		return confirmationModal({
			confirmText: $t('routes.organization.members.page.modal.approve-member.confirm'),
			handler: async () => await approveUser(memberId),
			header: $t('routes.organization.members.page.modal.approve-member.header'),
			message: $t('routes.organization.members.page.modal.approve-member.message')
		});
	}

	async function onRemoveUserPrompt(memberId: number): Promise<void> {
		return confirmationModal({
			confirmText: $t('routes.organization.members.page.modal.remove-member.confirm'),
			handler: async () => await removeUser(memberId),
			message: $t('routes.organization.members.page.modal.remove-member.message')
		});
	}

	async function approveUser(memberId: number): Promise<void> {
		const organizationId = $organizationStore?.id;
		if (!organizationId) return;
		const response = await organizationService.approveUser(organizationId, memberId);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update(organizationId);
		}
	}

	async function removeUser(memberId: number): Promise<void> {
		const organizationId = $organizationStore?.id;
		if (!organizationId) return;
		const response = await organizationService.removeUser(organizationId, memberId);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update(organizationId);
		}
	}

	async function onSelectRole(member: PersonOfOrganizationTO): Promise<void> {
		const organizationId = $organizationStore?.id as number;
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => onGrantOrganizationRolePrompt(member.id, organizationId, 'ROLE_ORGANIZATION_MANAGER'),
					icon: medalOutline,
					role: member.organizationRole === 'ROLE_ORGANIZATION_MANAGER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.manager')
				},
				{
					handler: () => onGrantOrganizationRolePrompt(member.id, organizationId, 'ROLE_ORGANIZATION_MEMBER'),
					icon: personOutline,
					role: member.organizationRole === 'ROLE_ORGANIZATION_MEMBER' ? 'selected' : undefined,
					text: $t('routes.organization.members.page.modal.select-role.member')
				}
			],
			header: $t('routes.organization.members.page.modal.select-role.header'),
			translucent: true
		});
		await actionsheet.present();
	}

	async function onGrantOrganizationRolePrompt(
		memberId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		if (role === members.find((member) => member.id === memberId)?.organizationRole) {
			return;
		}
		await confirmationModal({
			handler: async () => await grantOrganizationRole(memberId, organizationId, role),
			header: $t('routes.organization.members.page.modal.change-role.header'),
			message: $t('routes.organization.members.page.modal.change-role.message', {
				value: getRoleTranslationFromRole(role)
			})
		});
	}

	async function grantOrganizationRole(
		memberId: number,
		organizationId: number,
		role: OrganizationRole
	): Promise<void> {
		await organizationService.grantRole(organizationId, memberId, role);
	}

	function getGroupedMembers(members: PersonOfOrganizationTO[]): [string, PersonOfOrganizationTO[]][] {
		const result: Map<string, PersonOfOrganizationTO[]> = new SvelteMap();

		for (const member of members) {
			const key = member.username.charAt(0).toUpperCase();
			if (!result.has(key)) {
				result.set(key, []);
			}
			result.get(key)!.push(member);
		}

		return [...result.entries()].toSorted(([a], [b]) => a.localeCompare(b));
	}

	async function onWriteToClipboard(): Promise<void> {
		await Clipboard.write({
			string: $organizationStore?.organizationInvitationCode.code
		});
		if (dev)
			await showAlert($t('routes.organization.members.page.invitation-code.clipboard.info'), {
				type: AlertType.SUCCESS
			});
	}

	async function onShare(): Promise<void> {
		const result = await Share.canShare();
		if (result.value) {
			const organizationName = $organizationStore?.name;
			const organizationCode = $organizationStore?.organizationInvitationCode.code;
			await Share.share({
				text: $t('routes.organization.members.page.invitation-code.share.text', {
					value: organizationName,
					value2: organizationCode
				}),
				title: $t('routes.organization.members.page.invitation-code.share.title', { value: organizationName }),
				url: `${environment.apiUrl}/organization/invitation/${organizationCode}`
			});
		} else {
			await showAlert($t('routes.organization.members.page.invitation-code.share.error'));
		}
	}

	async function onRenewCode(): Promise<void> {
		const response = await organizationService.renewInvitationCode($organizationStore?.id!);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update($organizationStore?.id!);
		}
	}

	async function showQRCode(): Promise<void> {
		qrModalOpen = true;
	}

	async function onSendMail(): Promise<void> {
		try {
			const hasAccountResult = await EmailComposer.hasAccount();
			await (hasAccountResult.hasAccount
				? EmailComposer.open({
						body: $t('routes.organization.members.page.invitation-code.email.body', {
							value: $organizationStore?.organizationInvitationCode.code
						}),
						subject: $t('routes.organization.members.page.invitation-code.email.subject', {
							value: $organizationStore?.name
						})
					})
				: showAlert($t('routes.organization.members.page.invitation-code.email.error')));
		} catch {
			await showAlert($t('routes.organization.members.page.invitation-code.email.unsupported'));
		}
	}
</script>

<Layout title={$t('routes.organization.members.page.title')} showBackButton>
	{#if hasOrganizationRole('ROLE_ORGANIZATION_MANAGER')}
		<FabButton
			indexedLabel={$t('routes.organization.members.page.fab.invite-members.title')}
			icon={personAddOutline}
			clicked={() => (invitationCodeModalOpen = true)}
		/>
		{#if pendingMembers.length > 0}
			{@render pendingMembersCard()}
		{/if}
	{/if}

	{#if members.length > 0}
		{@render memberList()}
	{:else}
		{@render noMembers()}
	{/if}
</Layout>

<!-- Snippets-->

{#snippet pendingMembersCard()}
	<Card title={$t('routes.organization.members.page.card.pending-members.title')} border="secondary" classList="mt-5">
		{#each pendingMembers as member (member.id)}
			{@render pendingMemberItem(member)}
		{/each}
	</Card>
{/snippet}

{#snippet noMembers()}
	<div class="mt-5 flex flex-col items-center justify-center gap-5">
		<ion-note>{$t('routes.organization.members.page.no-members')}</ion-note>
		<Button
			icon={personAddOutline}
			label={$t('routes.organization.members.page.invite')}
			clicked={() => (invitationCodeModalOpen = true)}
		/>
	</div>
{/snippet}

{#snippet memberList()}
	<FadeInOut>
		<ion-list>
			{#each memberGroups as [letter, memberGroup] (letter)}
				<ion-item-group>
					<ion-item-divider class="bg-transparent">
						<ion-label>{letter}</ion-label>
					</ion-item-divider>

					{#each memberGroup as member (member.id)}
						{@render memberItem(member)}
					{/each}
				</ion-item-group>
			{/each}
		</ion-list>
	</FadeInOut>
{/snippet}

{#snippet memberItem(member: PersonOfOrganizationTO)}
	<CustomItem
		slidingOptions={hasOrganizationRole('ROLE_ORGANIZATION_MANAGER') ? getMemberSlidingOptions(member) : undefined}
	>
		<ion-avatar class="mb-2">
			<ion-icon icon={personCircleOutline} class="h-10 w-10" color="medium"></ion-icon>
		</ion-avatar>
		<ion-label class="ms-6">{member.username}</ion-label>
	</CustomItem>
{/snippet}

{#snippet pendingMemberItem(member: PersonOfOrganizationTO)}
	<CustomItem slidingOptions={getPendingMemberSlidingOptions(member)}>
		<ion-avatar class="mb-2">
			<ion-icon icon={personCircleOutline} class="h-10 w-10" color="medium"></ion-icon>
		</ion-avatar>
		<ion-label class="my-0 ms-6">{member.username}</ion-label>
	</CustomItem>
{/snippet}

<!-- Modals -->

<!-- Invitation Code Modal -->
<Modal open={invitationCodeModalOpen} informational dismissed={() => (invitationCodeModalOpen = false)} lazy>
	<Card title={$t('routes.organization.members.page.modal.invitation-code.card.title')}>
		<div class="flex flex-col">
			<div class="mx-12 rounded border border-(--ion-color-primary) p-2 text-center font-extrabold">
				<ion-note color="tertiary" class="text-2xl">
					{invitationCode.toUpperCase()}
				</ion-note>
			</div>
			<div class="mt-2 text-center">
				{#if isExpired}
					<ion-note color="danger">
						{$t('routes.organization.members.page.modal.invitation-code.card.note.code-expired')}
					</ion-note>
				{:else}
					<ion-note>
						{$t('routes.organization.members.page.modal.invitation-code.card.note.expires-in')}
						{formatDistanceToNow(invitationCodeExpiration, {
							addSuffix: true,
							includeSeconds: true,
							locale: getDateFnsLocale($localeStore)
						})}
					</ion-note>
				{/if}
			</div>
			<div class="mx-14 mt-2 flex items-center justify-between gap-2">
				<Button disabled={isExpired} icon={shareOutline} clicked={onShare} />
				<Button disabled={isExpired} icon={clipboardOutline} clicked={onWriteToClipboard} />
				<Button disabled={isExpired} icon={mailOutline} clicked={onSendMail} />
				<Button disabled={isExpired} icon={qrCode} clicked={showQRCode} />
			</div>
			<Button
				icon={refreshCircleOutline}
				fill="outline"
				classList="mx-8 mt-5"
				label={$t('routes.organization.members.page.modal.invitation-code.card.button.renew')}
				clicked={onRenewCode}
			/>
		</div>
	</Card>
</Modal>

<!-- QR Code Modal -->
<Popover extended open={qrModalOpen} dismissed={() => (qrModalOpen = false)}>
	<div class="pt-2 text-center">
		<ion-label class="font-bold">{$t('routes.organization.members.page.modal.qr-code.info-text')}</ion-label>
		<ion-breadcrumbs>
			<ion-breadcrumb class="flex items-center justify-center font-normal text-(--ion-text-color-step-200)">
				<ion-icon class="text-(--ion-text-color-step-200)" slot="start" icon={accessibilityOutline}></ion-icon>
				{$t('routes.organization.members.page.modal.qr-code.breadcrumb.first')}
			</ion-breadcrumb>
			<ion-breadcrumb class="flex items-center justify-center font-normal text-(--ion-text-color-step-200)">
				<ion-icon class="text-(--ion-text-color-step-200)" slot="start" icon={personAddOutline}></ion-icon>Join
				{$t('routes.organization.members.page.modal.qr-code.breadcrumb.second')}
			</ion-breadcrumb>
			<ion-breadcrumb class="flex items-center justify-center font-normal text-(--ion-text-color-step-200)">
				<ion-icon class="text-(--ion-text-color-step-200)" slot="start" icon={qrCodeOutline}></ion-icon>
			</ion-breadcrumb>
		</ion-breadcrumbs>
	</div>
	<QRCode data={$organizationStore?.organizationInvitationCode.code ?? ''} shape="circle" />
</Popover>
