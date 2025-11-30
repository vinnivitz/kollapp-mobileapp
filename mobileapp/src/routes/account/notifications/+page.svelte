<script lang="ts">
	import type { SegmentConfig } from '$lib/models/ui';

	import { notificationsCircleOutline, notificationsOffOutline, notificationsOutline } from 'ionicons/icons';

	import Layout from '$lib/components/layout/Layout.svelte';
	import SegmentItem from '$lib/components/widgets/ionic/SegmentItem.svelte';
	import { t } from '$lib/locales';

	enum NotificationFilter {
		ALL = 'all',
		READ = 'read',
		UNREAD = 'unread'
	}

	let notificationFilter = $state<NotificationFilter>(NotificationFilter.UNREAD);

	const segmentConfig: SegmentConfig[] = $derived([
		{
			clicked: () => (notificationFilter = NotificationFilter.UNREAD),
			color: 'danger',
			icon: notificationsCircleOutline,
			label: 'Unread',
			selected: notificationFilter === NotificationFilter.UNREAD
		},
		{
			clicked: () => (notificationFilter = NotificationFilter.ALL),
			color: 'secondary',
			icon: notificationsOutline,
			label: 'All',
			selected: notificationFilter === NotificationFilter.ALL
		},
		{
			clicked: () => (notificationFilter = NotificationFilter.READ),
			color: 'medium',
			icon: notificationsOffOutline,
			label: 'Read',
			selected: notificationFilter === NotificationFilter.READ
		}
	]);
</script>

<Layout showBackButton title={$t('routes.account.notifications.page.title')}>
	<SegmentItem config={segmentConfig} classList="text-center mt-5">
		{#if notificationFilter === NotificationFilter.UNREAD}
			<ion-note>{$t('routes.account.notifications.page.no-unread')}</ion-note>
		{:else if notificationFilter === NotificationFilter.ALL}
			<ion-note>{$t('routes.account.notifications.page.no-notifications')}</ion-note>
		{:else}
			<ion-note>{$t('routes.account.notifications.page.no-notifications')}</ion-note>
		{/if}
	</SegmentItem>
</Layout>
