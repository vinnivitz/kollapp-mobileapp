package org.kollapp.notification.application.publisher;

import java.util.List;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.springframework.stereotype.Service;

import org.kollapp.notification.application.model.enums.NotificationType;

/**
 * Publisher interface for notification events.
 * This allows other modules to trigger notifications without depending on the notification service directly.
 */
@SecondaryPort
@Service
public interface NotificationPublisher {
    /**
     * Publish an event to send a notification to a specific user.
     *
     * @param userId The user ID
     * @param title The notification title
     * @param body The notification body
     * @param notificationType The notification type
     * @param route Optional deep link route
     */
    void publishSendNotificationEvent(
            long userId, String title, String body, NotificationType notificationType, String route);

    /**
     * Publish an event to send a notification to multiple users.
     *
     * @param userIds The list of user IDs
     * @param title The notification title
     * @param body The notification body
     * @param notificationType The notification type
     * @param route Optional deep link route
     */
    void publishSendNotificationToUsersEvent(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route);
}
