<script lang="ts">
	import type { PushNotificationTO } from '$lib/api/dtos';
	import type { FabButtonButtons, ItemSlidingOption, SegmentConfig } from '$lib/models/ui';

	import { loadingController } from '@ionic/core';
	import {
		checkmarkDoneOutline,
		ellipsisVerticalOutline,
		notificationsCircleOutline,
		notificationsOffOutline,
		notificationsOutline,
		openOutline,
		trashBinOutline
	} from 'ionicons/icons';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import { goto } from '$app/navigation';

	import { notificationService } from '$lib/api/services';
	import Layout from '$lib/components/layout/Layout.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import FabButton from '$lib/components/widgets/ionic/FabButton.svelte';
	import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';
	import { t } from '$lib/locales';
	import { StorageKey } from '$lib/models/storage';
	import { notificationStore } from '$lib/stores';
	import { confirmationModal, formatter, getStoredValue, StatusCheck, storeValue } from '$lib/utility';

	enum NotificationFilter {
		ALL = 'all',
		READ = 'read',
		UNREAD = 'unread'
	}

	let notificationFilter = $state<NotificationFilter>(NotificationFilter.UNREAD);
	let searchValue = $state<string>('');
	const readNotificationIds = new SvelteSet<number>();

	const notifications = $derived(
		($notificationStore ?? []).toSorted((a, b) => {
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		})
	);
	const filteredNotifications = $derived(
		notifications.filter((notification) => {
			const normalizedSearchValue = searchValue.trim().toLowerCase();
			if (normalizedSearchValue) {
				const haystack = `${notification.title} ${notification.body}`.toLowerCase();
				if (!haystack.includes(normalizedSearchValue)) return false;
			}

			const isRead = readNotificationIds.has(notification.id);
			switch (notificationFilter) {
				case NotificationFilter.UNREAD: {
					return !isRead;
				}
				case NotificationFilter.READ: {
					return isRead;
				}
				default: {
					return true;
				}
			}
		})
	);

	const segmentConfig: SegmentConfig[] = $derived([
		{
			clicked: () => (notificationFilter = NotificationFilter.UNREAD),
			color: 'danger',
			icon: notificationsCircleOutline,
			label: $t('routes.account.notifications.page.unread'),
			selected: notificationFilter === NotificationFilter.UNREAD
		},
		{
			clicked: () => (notificationFilter = NotificationFilter.ALL),
			color: 'secondary',
			icon: notificationsOutline,
			label: $t('routes.account.notifications.page.all'),
			selected: notificationFilter === NotificationFilter.ALL
		},
		{
			clicked: () => (notificationFilter = NotificationFilter.READ),
			color: 'medium',
			icon: notificationsOffOutline,
			label: $t('routes.account.notifications.page.read'),
			selected: notificationFilter === NotificationFilter.READ
		}
	]);

	const fabButtons = $derived<FabButtonButtons[]>(getFabButtons());

	onMount(async () => await loadReadNotificationIds());

	function getFabButtons(): FabButtonButtons[] {
		if (notificationFilter === NotificationFilter.UNREAD && filteredNotifications.length > 0) {
			return [
				{
					color: 'secondary',
					handler: async () => await onMarkAllUnreadAsReadPrompt(),
					icon: checkmarkDoneOutline,
					label: $t('routes.account.notifications.page.mark-all-read')
				}
			];
		} else if (notificationFilter === NotificationFilter.ALL && filteredNotifications.length > 0) {
			return [
				{
					color: 'danger',
					handler: async () => await onDeleteAllNotificationsPrompt(),
					icon: trashBinOutline,
					label: $t('routes.account.notifications.page.delete-all')
				}
			];
		} else {
			return [];
		}
	}

	async function loadReadNotificationIds(): Promise<void> {
		const stored = (await getStoredValue<number[]>(StorageKey.NOTIFICATIONS_READ)) ?? [];
		readNotificationIds.clear();
		for (const id of stored) {
			readNotificationIds.add(id);
		}
	}

	async function markNotificationAsRead(notification: PushNotificationTO): Promise<void> {
		if (readNotificationIds.has(notification.id)) return;
		readNotificationIds.add(notification.id);
		await storeValue(StorageKey.NOTIFICATIONS_READ, [...readNotificationIds]);
	}

	async function deleteNotification(notification: PushNotificationTO): Promise<void> {
		const remainingNotifications = ($notificationStore ?? []).filter((n) => n.id !== notification.id);
		await notificationStore.set(remainingNotifications);

		if (readNotificationIds.has(notification.id)) {
			const loader = await loadingController.create({});
			await loader.present();
			const result = await notificationService.deleteNotification(notification.id);
			if (StatusCheck.isOK(result.status)) {
				readNotificationIds.delete(notification.id);
				await storeValue(StorageKey.NOTIFICATIONS_READ, [...readNotificationIds]);
			}
			await loader.dismiss();
		}
	}

	async function openNotification(notification: PushNotificationTO): Promise<void> {
		await markNotificationAsRead(notification);
		if (notification.route) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(notification.route);
		}
	}

	function getNotificationSlidingOptions(notification: PushNotificationTO): ItemSlidingOption[] {
		const options: ItemSlidingOption[] = [];
		const isRead = readNotificationIds.has(notification.id);

		if (!isRead) {
			options.push({
				color: 'secondary',
				handler: () => void markNotificationAsRead(notification),
				icon: checkmarkDoneOutline
			});
		}

		if (notification.route) {
			options.push({
				color: 'primary',
				handler: () => void openNotification(notification),
				icon: openOutline
			});
		}

		options.push({
			color: 'danger',
			handler: () => void deleteNotification(notification),
			icon: trashBinOutline
		});

		return options;
	}

	async function onMarkAllUnreadAsReadPrompt(): Promise<void> {
		return confirmationModal({
			confirmText: $t('routes.account.notifications.page.modal.mark-all-read.confirm'),
			handler: async () => await markAllUnreadAsRead(),
			header: $t('routes.account.notifications.page.modal.mark-all-read.header'),
			message: $t('routes.account.notifications.page.modal.mark-all-read.message')
		});
	}

	async function markAllUnreadAsRead(): Promise<void> {
		const unreadNotifications = notifications.filter((notification) => !readNotificationIds.has(notification.id));
		if (unreadNotifications.length === 0) return;
		for (const notification of unreadNotifications) {
			readNotificationIds.add(notification.id);
		}
		await storeValue(StorageKey.NOTIFICATIONS_READ, [...readNotificationIds]);
	}

	async function onDeleteAllNotificationsPrompt(): Promise<void> {
		await confirmationModal({
			confirmText: $t('routes.account.notifications.page.modal.delete-all.confirm'),
			handler: async () => await deleteAllNotifications(),
			header: $t('routes.account.notifications.page.modal.delete-all.header'),
			message: $t('routes.account.notifications.page.modal.delete-all.message')
		});
	}

	async function deleteAllNotifications(): Promise<void> {
		const loader = await loadingController.create({});
		await loader.present();
		const result = await notificationService.deleteAllNotifications();
		if (StatusCheck.isOK(result.status)) {
			await notificationStore.set([]);
			readNotificationIds.clear();
			await storeValue(StorageKey.NOTIFICATIONS_READ, []);
		}
		await loader.dismiss();
	}

	function onSearch(event: CustomEvent): void {
		searchValue = (event.detail?.value ?? '') as string;
	}
</script>

<Layout showBackButton title={$t('routes.account.notifications.page.title')} scrollable={false}>
	<div class="flex h-full flex-col">
		<div class="shrink-0">
			<div class="">
				<SegmentItem config={segmentConfig} />
			</div>
			<ion-searchbar
				color="light"
				show-clear-button="always"
				debounce={100}
				placeholder={$t('routes.account.notifications.page.search')}
				onionInput={onSearch}
				value={searchValue}
			></ion-searchbar>
		</div>
		<div class="min-h-0 flex-1 overflow-auto">
			<div class="text-center">
				{#if filteredNotifications.length === 0}
					{#if notificationFilter === NotificationFilter.UNREAD}
						<ion-note>{$t('routes.account.notifications.page.no-unread')}</ion-note>
					{:else}
						<ion-note>{$t('routes.account.notifications.page.no-notifications')}</ion-note>
					{/if}
				{:else}
					<ion-list inset>
						{#each filteredNotifications as notification (notification.id)}
							{@const isRead = readNotificationIds.has(notification.id)}
							<CustomItem
								slidingOptions={getNotificationSlidingOptions(notification)}
								clicked={notification.route ? () => openNotification(notification) : undefined}
								icon={isRead ? notificationsOffOutline : notificationsCircleOutline}
							>
								<div class="my-1 ms-2 flex-1">
									<div class="flex flex-wrap items-center justify-between">
										<div class:font-bold={!isRead} class="text-sm">{notification.title}</div>
										<ion-note class="text-xs">{formatter.date(notification.createdAt)}</ion-note>
									</div>
									<div class:font-bold={!isRead} class="text-xs">{notification.body}</div>
								</div>
							</CustomItem>
						{/each}
					</ion-list>
				{/if}
			</div>
		</div>
	</div>

	{#if fabButtons.length > 0}
		<FabButton icon={ellipsisVerticalOutline} buttons={fabButtons} />
	{/if}
</Layout>
