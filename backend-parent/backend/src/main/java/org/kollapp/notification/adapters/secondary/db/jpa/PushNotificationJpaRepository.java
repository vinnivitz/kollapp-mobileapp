package org.kollapp.notification.adapters.secondary.db.jpa;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.kollapp.notification.adapters.secondary.db.jpa.entities.PushNotificationEntity;

/**
 * JPA repository for push notifications.
 */
public interface PushNotificationJpaRepository extends JpaRepository<PushNotificationEntity, Long> {
    /**
     * Find all notifications for a user ordered by creation date descending.
     *
     * @param userId The user ID
     * @return List of notifications
     */
    List<PushNotificationEntity> findByUserIdOrderByCreatedAtDesc(long userId);

    /**
     * Find notifications for a user with pagination.
     *
     * @param userId The user ID
     * @param pageable Pagination parameters
     * @return List of notifications ordered by creation date descending
     */
    List<PushNotificationEntity> findByUserIdOrderByCreatedAtDesc(long userId, Pageable pageable);

    /**
     * Delete a notification by ID and user ID.
     *
     * @param id The notification ID
     * @param userId The user ID
     */
    void deleteByIdAndUserId(long id, long userId);

    /**
     * Delete all notifications for a user.
     *
     * @param userId The user ID
     */
    void deleteAllByUserId(long userId);
}
