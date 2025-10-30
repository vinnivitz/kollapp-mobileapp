<script lang="ts">
	import type { MemberModel } from '$lib/models/models';

	import { Clipboard } from '@capacitor/clipboard';
	import { Share } from '@capacitor/share';
	import { TZDate } from '@date-fns/tz';
	import QRCode from '@svelte-put/qr/svg/QR.svelte';
	import { EmailComposer } from 'capacitor-email-composer';
	import { formatDistanceToNow } from 'date-fns';
	import { actionSheetController } from 'ionic-svelte';
	import {
		clipboardOutline,
		logOutOutline,
		mailOutline,
		medalOutline,
		personAddOutline,
		personCircleOutline,
		personOutline,
		qrCode,
		refreshCircleOutline,
		ribbonOutline,
		shareOutline
	} from 'ionicons/icons';
	import { fade } from 'svelte/transition';

	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import Popover from '$lib/components/widgets/ionic/Popover.svelte';
	import { t } from '$lib/locales';
	import { UserRole } from '$lib/models/api';
	import { AlertType, type ItemSlidingOption } from '$lib/models/ui';
	import { localeStore, organizationStore, userStore } from '$lib/stores';
	import { getDateFnsLocale, hasRole, showAlert, StatusCheck } from '$lib/utility';

	let invitationCodeModalOpen = $state(false);
	let qrModalOpen = $state(false);

	function getSlidingOptions(member: MemberModel): ItemSlidingOption[] {
		return [
			{ color: 'tertiary', handler: () => onSelectRole(member), icon: ribbonOutline },
			{ color: 'danger', handler: () => onRemoveUser(member.id), icon: logOutOutline }
		];
	}

	const userId = $derived($userStore?.id);

	const invitationCodeExpiration = $derived(
		new TZDate($organizationStore?.organizationInvitationCode.expirationDate ?? new TZDate())
	);
	const inviationCode = $derived($organizationStore?.organizationInvitationCode.code ?? '');

	const members = $derived(
		($organizationStore?.personsOfOrganization ?? [])
			.sort((a, b) => a.username.localeCompare(b.username))
			.filter((member) => member.userId !== userId)
	);

	const memberGroups = $derived(getGroupedMembers(members));

	async function onRemoveUser(userId: number): Promise<void> {
		const organizationId = $organizationStore?.id;
		if (!organizationId) return;
		const response = await organizationResource.removeUserFromOrganization(organizationId, userId);
		if (StatusCheck.isOK(response.status)) {
			await organizationStore.update(organizationId);
		}
	}

	async function onSelectRole(member: MemberModel): Promise<void> {
		const organizationId = $organizationStore?.id;
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => grantUserRole(member.id, organizationId!, UserRole.ORGANIZATION_MEMBER),
					icon: medalOutline,
					role: member.role === UserRole.ORGANIZATION_MEMBER ? 'selected' : undefined,
					text: $t('routes.organization.page.members.select-user-role.role.manager')
				},
				{
					handler: () => grantUserRole(member.id, organizationId!, UserRole.USER),
					icon: personOutline,
					role: member.role === UserRole.USER ? 'selected' : undefined,
					text: $t('routes.organization.page.members.select-user-role.role.user')
				}
			],
			header: $t('routes.organization.page.members.select-user-role.header'),
			translucent: true
		});
		await actionsheet.present();
	}

	async function grantUserRole(userId: number, organizationId: number, role: UserRole): Promise<void> {
		await organizationResource.grantUserRole(userId, organizationId, role);
	}

	function getGroupedMembers(members: MemberModel[]): [string, MemberModel[]][] {
		const result: Map<string, MemberModel[]> = new Map();

		for (const member of members) {
			const key = member.username.charAt(0).toUpperCase();
			if (!result.has(key)) {
				result.set(key, []);
			}
			result.get(key)!.push(member);
		}

		return [...result.entries()].sort(([a], [b]) => a.localeCompare(b));
	}

	async function onWriteToClipboard(): Promise<void> {
		await Clipboard.write({
			string: $organizationStore?.organizationInvitationCode.code
		});
		await showAlert($t('routes.organization.page.members.share.success'), { type: AlertType.SUCCESS });
	}

	async function onShare(): Promise<void> {
		const result = await Share.canShare();
		if (result.value) {
			const organizationName = $organizationStore?.name;
			const organizationCode = $organizationStore?.organizationInvitationCode.code;
			await Share.share({
				text: `Join ${organizationName} using this invitation code: ${organizationCode}`,
				title: `Invite to join ${organizationName} on Kollapp!`,
				url: `https://api.kollapp.org/api/organization/invitation/${organizationCode}`
			});
		} else {
			showAlert($t('routes.organization.page.members.share.not-supported'));
		}
	}

	async function onRenewCode(): Promise<void> {
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			const response = await organizationResource.renewInvitationCode(organizationId);
			if (StatusCheck.isOK(response.status)) {
				await organizationStore.update(organizationId);
			}
		} else {
			await showAlert('Failed to renew invitation code. Please try again later.');
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
						body: `Use this invitation code to join: ${$organizationStore?.organizationInvitationCode.code}`,
						subject: `Join ${$organizationStore?.name} on Kollapp!`
					})
				: showAlert('Default email app is not configured.'));
		} catch {
			await showAlert('Sending email is not supported on this device.');
		}
	}
</script>

<Layout title={$t('routes.organization.page.members.title')} showBackButton>
	{#if hasRole(UserRole.ORGANIZATION_MEMBER)}
		<FabButton label="Invite member" icon={personAddOutline} clicked={() => (invitationCodeModalOpen = true)} />
	{/if}

	{#if members.length === 0}
		<div class="mt-5 flex flex-col items-center justify-center gap-5">
			<ion-note>No other members found.</ion-note>
			<Button icon={personAddOutline} label="Invite person" clicked={() => (invitationCodeModalOpen = true)} />
		</div>
	{:else}
		<ion-list in:fade={{ delay: 150, duration: 100 }} out:fade={{ delay: 0, duration: 100 }}>
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
	{/if}
</Layout>

{#snippet memberItem(member: MemberModel)}
	<CustomItem slidingOptions={getSlidingOptions(member)}>
		<ion-avatar class="mb-1">
			<ion-icon icon={personCircleOutline} class="h-10 w-10" color="medium"></ion-icon>
		</ion-avatar>
		<ion-label class="ms-6">{member.username}</ion-label>
	</CustomItem>
{/snippet}

<Modal open={invitationCodeModalOpen} informational dismissed={() => (invitationCodeModalOpen = false)} lazy>
	<Card title="Invitation Code">
		<div class="flex flex-col">
			<div class="mx-12 rounded border border-[var(--ion-color-primary)] p-2 text-center font-extrabold">
				<ion-note color="tertiary" class="text-2xl">
					{inviationCode.toUpperCase()}
				</ion-note>
			</div>
			<div class="mt-2 text-center">
				{#if invitationCodeExpiration.getTime() <= Date.now()}
					<ion-note color="danger">
						{$t('routes.organization.page.members.modal.invitation-code.is-expired')}
					</ion-note>
				{:else}
					<ion-note>
						{$t('routes.organization.page.members.modal.invitation-code.expires-in')}
						{formatDistanceToNow(invitationCodeExpiration, {
							addSuffix: true,
							includeSeconds: true,
							locale: getDateFnsLocale($localeStore)
						})}
					</ion-note>
				{/if}
			</div>
			<div class="mx-14 mt-2 flex items-center justify-between gap-2">
				<Button shape="round" icon={shareOutline} clicked={onShare}></Button>
				<Button shape="round" icon={clipboardOutline} clicked={onWriteToClipboard}></Button>
				<Button shape="round" icon={mailOutline} clicked={onSendMail}></Button>
				<Button shape="round" icon={qrCode} clicked={showQRCode}></Button>
			</div>
			<Button
				icon={refreshCircleOutline}
				fill="outline"
				classList="mx-8 mt-5"
				label="Renew invitation code"
				clicked={onRenewCode}
			></Button>
		</div>
	</Card>
</Modal>

<!-- svelte-ignore event_directive_deprecated -->
<Popover extended open={qrModalOpen} dismissed={() => (qrModalOpen = false)}>
	<QRCode data={$organizationStore?.organizationInvitationCode.code ?? ''} shape="circle" />
</Popover>
