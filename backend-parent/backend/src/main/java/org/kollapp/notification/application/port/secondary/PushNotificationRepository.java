package org.kollapp.notification.application.port.secondary;

import java.util.List;

import org.jmolecules.architecture.hexagonal.SecondaryPort;

import org.kollapp.notification.domain.entities.PushNotification;

/**
 * Repository interface for push notification operations.
 */
@SecondaryPort
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

    /**
     * Delete a notification by ID and user ID.
     *
     * @param notificationId The notification ID
     * @param userId The user ID
     */
    void deleteByIdAndUserId(long notificationId, long userId);

    /**
     * Delete all notifications for a user.
     *
     * @param userId The user ID
     */
    void deleteAllByUserId(long userId);
}
