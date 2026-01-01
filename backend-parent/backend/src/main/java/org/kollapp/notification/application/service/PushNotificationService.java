package org.kollapp.notification.application.service;

import java.util.List;
import java.util.Map;

import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.enums.DeviceType;
import org.kollapp.notification.application.model.enums.NotificationType;

/**
 * Service interface for push notification operations.
 */
public interface PushNotificationService {
    /**
     * Register a device token for a user.
     *
     * @param userId The user ID
     * @param token The device token
     * @param deviceType The device type
     * @return The registered device token
     */
    DeviceToken registerDeviceToken(Long userId, String token, DeviceType deviceType);

    /**
     * Unregister a device token.
     *
     * @param token The device token to unregister
     */
    void unregisterDeviceToken(String token);

    /**
     * Get all active device tokens for a user.
     *
     * @param userId The user ID
     * @return List of active device tokens
     */
    List<DeviceToken> getUserDeviceTokens(Long userId);

    /**
     * Send a push notification to a specific user.
     *
     * @param userId The user ID
     * @param title The notification title
     * @param body The notification body
     * @param notificationType The notification type
     * @param data Additional data payload
     */
    void sendNotificationToUser(
            Long userId, String title, String body, NotificationType notificationType, Map<String, String> data);

    /**
     * Send a push notification to specific users.
     *
     * @param userIds The list of user IDs
     * @param title The notification title
     * @param body The notification body
     * @param notificationType The notification type
     * @param data Additional data payload
     */
    void sendNotificationToUsers(
            List<Long> userIds, String title, String body, NotificationType notificationType, Map<String, String> data);

    /**
     * Send a push notification to a specific device token.
     *
     * @param token The device token
     * @param title The notification title
     * @param body The notification body
     * @param notificationType The notification type
     * @param data Additional data payload
     */
    void sendNotificationToToken(
            String token, String title, String body, NotificationType notificationType, Map<String, String> data);
}
