package org.kollapp.notification.adapters.secondary.db.jpa;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.kollapp.notification.application.model.entities.PushNotification;

/**
 * JPA repository for push notifications.
 */
public interface PushNotificationJpaRepository extends JpaRepository<PushNotification, Long> {
    /**
     * Find all notifications for a user ordered by creation date descending.
     *
     * @param userId The user ID
     * @return List of notifications
     */
    List<PushNotification> findByUserIdOrderByCreatedAtDesc(long userId);

    /**
     * Find notifications for a user with pagination.
     *
     * @param userId The user ID
     * @param pageable Pagination parameters
     * @return List of notifications ordered by creation date descending
     */
    List<PushNotification> findByUserIdOrderByCreatedAtDesc(long userId, Pageable pageable);
}
