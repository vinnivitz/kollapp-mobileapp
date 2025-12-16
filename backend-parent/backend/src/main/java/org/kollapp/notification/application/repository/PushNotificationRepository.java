package org.kollapp.notification.application.repository;

import org.kollapp.notification.application.model.entities.PushNotification;

/**
 * Repository interface for push notification operations.
 */
public interface PushNotificationRepository {
    /**
     * Save a push notification.
     *
     * @param notification The notification to save
     * @return The saved notification
     */
    PushNotification save(PushNotification notification);
}
