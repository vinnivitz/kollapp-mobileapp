<script lang="ts">
	import type { MemberModel } from '$lib/models/models';

	import { actionSheetController } from 'ionic-svelte';
	import {
		medalOutline,
		personAddOutline,
		personCircleOutline,
		personOutline,
		ribbonOutline,
		trashBinOutline
	} from 'ionicons/icons';
	import { get } from 'svelte/store';
	import { fade } from 'svelte/transition';

	import { organizationResource } from '$lib/api/resources';
	import Layout from '$lib/components/layout/Layout.svelte';
	import Button from '$lib/components/widgets/ionic/Button.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import { UserRole } from '$lib/models/api';
	import { organizationStore, userStore } from '$lib/stores';
	import { clickOutside, showAlert } from '$lib/utility';

	let memberList = <HTMLIonListElement | undefined>$state();

	const userId = $derived($userStore?.id);

	const members = $derived(
		($organizationStore?.personsOfOrganization ?? [])
			.sort((a, b) => a.username.localeCompare(b.username))
			.filter((member) => member.id !== userId)
	);

	const memberGroups = $derived(getGroupedMembers(members));

	async function onSelectRole(member: MemberModel): Promise<void> {
		const organizationId = get(organizationStore)?.id;
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

	$effect(() => {
		console.log('members', members);
		console.log('user', $userStore);
	});

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
</script>

<Layout title="Manage members" showBackButton>
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
