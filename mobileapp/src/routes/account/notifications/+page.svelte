<script lang="ts">
	import type { SegmentConfig } from '$lib/models/ui';

	import { notificationsCircleOutline, notificationsOffOutline, notificationsOutline } from 'ionicons/icons';

	import { SegmentItem } from '$lib/components/core';
	import { FadeInOut } from '$lib/components/core/animation';
	import { Layout } from '$lib/components/layout';
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
</script>

<Layout showBackButton title={$t('routes.account.notifications.page.title')}>
	<SegmentItem config={segmentConfig} classList="text-center mt-5">
		{#if notificationFilter === NotificationFilter.UNREAD}
			<FadeInOut>
				<ion-note>{$t('routes.account.notifications.page.no-unread')}</ion-note>
			</FadeInOut>
		{:else if notificationFilter === NotificationFilter.ALL}
			<FadeInOut>
				<ion-note>{$t('routes.account.notifications.page.no-notifications')}</ion-note>
			</FadeInOut>
		{:else}
			<FadeInOut>
				<ion-note>{$t('routes.account.notifications.page.no-notifications')}</ion-note>
			</FadeInOut>
		{/if}
	</SegmentItem>
</Layout>
