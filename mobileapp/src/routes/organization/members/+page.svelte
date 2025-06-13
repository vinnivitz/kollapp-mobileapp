<script lang="ts">
	import type { MemberModel } from '$lib/models/models';

	import { Clipboard } from '@capacitor/clipboard';
	import { Share } from '@capacitor/share';
	import { actionSheetController } from 'ionic-svelte';
	import {
		clipboardOutline,
		mailOutline,
		medalOutline,
		personAddOutline,
		personCircleOutline,
		personOutline,
		refreshCircleOutline,
		ribbonOutline,
		shareOutline,
		trashBinOutline
	} from 'ionicons/icons';
	import { fade } from 'svelte/transition';

	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import Card from '$lib/components/widgets/ionic/Card.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import Modal from '$lib/components/widgets/ionic/Modal.svelte';
	import { UserRole } from '$lib/models/api';
	import { AlertType } from '$lib/models/ui';
	import { organizationStore, userStore } from '$lib/stores';
	import { clickOutside, showAlert, StatusCheck } from '$lib/utility';

	let memberList = <HTMLIonListElement | undefined>$state();
	let invitationCodeModalOpen = $state(false);

	const userId = $derived($userStore?.id);

	const members = $derived(
		($organizationStore?.personsOfOrganization ?? [])
			.sort((a, b) => a.username.localeCompare(b.username))
			.filter((member) => member.id !== userId)
	);

	const memberGroups = $derived(getGroupedMembers(members));

	async function onSelectRole(member: MemberModel): Promise<void> {
		const organizationId = $organizationStore?.id;
		const actionsheet = await actionSheetController.create({
			buttons: [
				{
					handler: () => grantUserRole(member.id, organizationId!, UserRole.MANAGER),
					icon: medalOutline,
					role: member.role === UserRole.MANAGER ? 'selected' : undefined,
					text: 'Manager'
				},
				{
					handler: () => grantUserRole(member.id, organizationId!, UserRole.USER),
					icon: personOutline,
					role: member.role === UserRole.USER ? 'selected' : undefined,
					text: 'User'
				}
			],
			header: 'Select user role',
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

	let slidingMap: Map<number, HTMLIonItemSlidingElement> = new Map();

	function storeSliding(node: HTMLIonItemSlidingElement, memberId: number): { destroy: () => void } {
		slidingMap.set(memberId, node);
		return {
			destroy(): void {
				slidingMap.delete(memberId);
			}
		};
	}

	async function onWriteToClipboard(): Promise<void> {
		await Clipboard.write({
			string: $organizationStore?.organizationInvitationCode.code
		});
	}

	async function onShare(): Promise<void> {
		const result = await Share.canShare();
		if (result.value) {
			const organizationName = $organizationStore?.name;
			const organizationCode = $organizationStore?.organizationInvitationCode.code;
			await Share.share({
				text: `Join ${organizationName} using this invitation code: ${organizationCode}`,
				title: `Invite to join ${organizationName} on Kollapp!`,
				url: `kollapp://organization/join?code=${organizationCode}`
			});
		} else {
			showAlert('Sharing is not supported on this device.');
		}
	}

	async function onRenewCode(): Promise<void> {
		const organizationId = $organizationStore?.id;
		if (organizationId) {
			const response = await organizationResource.renewInvitationCode(organizationId);
			console.log('id', $organizationStore?.id);
			if (StatusCheck.isOK(response.status)) {
				await organizationStore.init();
				await showAlert('Invitation code renewed successfully.', { type: AlertType.SUCCESS });
			}
		} else {
			showAlert('Failed to renew invitation code. Please try again later.');
		}
	}
</script>

<Layout title="Manage members" showBackButton>
	{#if !$userStore?.roles.includes(UserRole.MANAGER)}
		<FabButton icon={personAddOutline} click={() => (invitationCodeModalOpen = true)}></FabButton>
	{/if}

	{#if members.length === 0}
		<div class="mt-5 flex flex-col items-center justify-center gap-5">
			<ion-note>No other members found.</ion-note>
			<Button icon={personAddOutline} label="Invite person" click={() => showAlert('Feature not implemented yet.')} />
		</div>
	{:else}
		<!-- svelte-ignore event_directive_deprecated -->
		<ion-list
			in:fade={{ delay: 150, duration: 100 }}
			out:fade={{ delay: 0, duration: 100 }}
			use:clickOutside
			bind:this={memberList}
			on:blur={memberList?.closeSlidingItems}
		>
			{#each memberGroups as [letter, memberGroup] (letter)}
				<ion-item-group>
					<ion-item-divider class="bg-transparent">
						<ion-label>{letter}</ion-label>
					</ion-item-divider>

					{#each memberGroup as member, index (member.id)}
						{@render memberItem(member, index === memberGroup.length - 1)}
					{/each}
				</ion-item-group>
			{/each}
		</ion-list>
	{/if}
</Layout>

{#snippet memberItem(member: MemberModel, isLastItem: boolean)}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore event_directive_deprecated -->
	<ion-item-sliding use:storeSliding={member.id}>
		<CustomItem bottomBorder={!isLastItem} button click={() => slidingMap.get(member.id)?.open('end')}>
			<ion-avatar class="mb-1">
				<ion-icon icon={personCircleOutline} class="h-10 w-10" color="medium"></ion-icon>
			</ion-avatar>
			<ion-label class="ms-6">{member.username}</ion-label>
		</CustomItem>

		<ion-item-options slot="end">
			<ion-item-option color="tertiary" on:click={() => onSelectRole(member)}>
				<ion-icon slot="icon-only" icon={ribbonOutline}></ion-icon>
			</ion-item-option>
			<ion-item-option color="danger" expandable>
				<ion-icon slot="icon-only" icon={trashBinOutline}></ion-icon>
			</ion-item-option>
		</ion-item-options>
	</ion-item-sliding>
{/snippet}

<Modal open={invitationCodeModalOpen} cancel={() => (invitationCodeModalOpen = false)}>
	<Card title="Invitation Code">
		<div class="flex flex-col">
			<div class="mx-12 rounded border border-[var(--ion-color-primary)] p-2 text-center font-extrabold">
				<ion-note color="primary" class="text-2xl"
					>{$organizationStore?.organizationInvitationCode.code.toUpperCase()}</ion-note
				>
			</div>
			<div class="mx-14 mt-2 flex items-center justify-between gap-2">
				<Button shape="round" icon={shareOutline} click={onShare}></Button>
				<Button shape="round" icon={clipboardOutline} click={onWriteToClipboard}></Button>
				<Button shape="round" icon={mailOutline} click={() => {}}></Button>
			</div>
			<Button
				icon={refreshCircleOutline}
				fill="outline"
				classList="mx-8 mt-5"
				label="Renew invitation code"
				click={onRenewCode}
			></Button>
		</div>
	</Card>
</Modal>
