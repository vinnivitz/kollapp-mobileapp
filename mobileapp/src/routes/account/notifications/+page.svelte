<script lang="ts">
	import { notificationsCircleOutline, notificationsOffOutline, notificationsOutline } from 'ionicons/icons';

	import Layout from '$lib/components/layout/Layout.svelte';
	import Chip from '$lib/components/widgets/ionic/Chip.svelte';

	enum NotificationFilter {
		ALL = 'all',
		READ = 'read',
		UNREAD = 'unread'
	}

	let notificationFilter = $state(NotificationFilter.UNREAD);
</script>

<Layout showBackButton title="Notifications">
	<div class="text-center">
		<div class="mb-2 flex items-center justify-center gap-3 rounded-full bg-(--ion-background-color-step-50) px-5 py-1">
			<Chip
				color="danger"
				label="Unread"
				icon={notificationsCircleOutline}
				selected={notificationFilter === NotificationFilter.UNREAD}
				clicked={() => (notificationFilter = NotificationFilter.UNREAD)}
			/>
			<Chip
				color="secondary"
				label="All"
				icon={notificationsOutline}
				selected={notificationFilter === NotificationFilter.ALL}
				clicked={() => (notificationFilter = NotificationFilter.ALL)}
			/>
			<Chip
				color="medium"
				label="Read"
				icon={notificationsOffOutline}
				selected={notificationFilter === NotificationFilter.READ}
				clicked={() => (notificationFilter = NotificationFilter.READ)}
			/>
		</div>
	</div>
	<div class="mt-5 text-center">
		<ion-note>No notifications found.</ion-note>
	</div>
</Layout>
