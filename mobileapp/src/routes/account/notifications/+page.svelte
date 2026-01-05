<script lang="ts">
	import type { PushNotificationTO } from '$lib/api/dtos';
	import type { SegmentConfig } from '$lib/models/ui';

	import { notificationsCircleOutline, notificationsOffOutline, notificationsOutline } from 'ionicons/icons';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	import { goto } from '$app/navigation';

	import Layout from '$lib/components/layout/Layout.svelte';
	import CustomItem from '$lib/components/widgets/ionic/CustomItem.svelte';
	import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';
	import { t } from '$lib/locales';
	import { StorageKey } from '$lib/models/storage';
	import { notificationStore } from '$lib/stores';
	import { formatter, getStoredValue, storeValue } from '$lib/utility';

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

	onMount(async () => await loadReadNotificationIds());

	async function loadReadNotificationIds(): Promise<void> {
		const stored = (await getStoredValue<number[]>(StorageKey.NOTIFICATIONS_READ)) ?? [];
		readNotificationIds.clear();
		for (const id of stored) {
			readNotificationIds.add(id);
		}
	}

	async function openNotification(notification: PushNotificationTO): Promise<void> {
		if (!readNotificationIds.has(notification.id)) {
			readNotificationIds.add(notification.id);
			await storeValue(StorageKey.NOTIFICATIONS_READ, [...readNotificationIds]);
		}

		if (notification.route) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(notification.route);
		}
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
								clicked={() => openNotification(notification)}
								detail={!!notification.route}
								icon={isRead ? notificationsOffOutline : notificationsCircleOutline}
							>
								<div class="my-1 ms-2">
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
</Layout>
