package org.kollapp.notification.application.publisher;

import java.util.List;
import java.util.Map;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.springframework.stereotype.Service;

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
     * @param data Additional data payload
     */
    void publishSendNotificationEvent(Long userId, String title, String body, Map<String, String> data);

    /**
     * Publish an event to send a notification to multiple users.
     *
     * @param userIds The list of user IDs
     * @param title The notification title
     * @param body The notification body
     * @param data Additional data payload
     */
    void publishSendNotificationToUsersEvent(List<Long> userIds, String title, String body, Map<String, String> data);

    /**
     * Publish an event to send a notification to all members of an organization.
     *
     * @param organizationId The organization ID
     * @param userIds The list of user IDs to send notifications to
     * @param title The notification title
     * @param body The notification body
     * @param data Additional data payload
     */
    void publishSendNotificationToOrganizationEvent(
            Long organizationId, List<Long> userIds, String title, String body, Map<String, String> data);
}
