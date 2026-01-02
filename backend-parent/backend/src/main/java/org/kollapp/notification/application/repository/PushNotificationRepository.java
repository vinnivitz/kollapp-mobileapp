package org.kollapp.notification.application.repository;

import java.util.List;

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

    /**
     * Find notifications for a specific user, ordered by creation date descending.
     *
     * @param userId The user ID
     * @param limit Maximum number of notifications to return (null for all)
     * @return List of push notifications ordered by creation date descending
     */
    List<PushNotification> findByUserIdOrderByCreatedAtDesc(long userId, Integer limit);
}
