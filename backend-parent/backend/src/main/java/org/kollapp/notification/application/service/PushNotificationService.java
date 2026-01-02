package org.kollapp.notification.application.service;

import java.util.List;

import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
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
    DeviceToken registerDeviceToken(long userId, String token, DeviceType deviceType, String deviceName);

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
    List<DeviceToken> getUserDeviceTokens(long userId);

    /**
     * Send a push notification to a specific user.
     *
     * @param userId The user ID
     * @param title The notification title
     * @param body The notification body
     * @param notificationType The notification type
     * @param route Optional deep link route
     */
    void sendNotificationToUser(
            long userId, String title, String body, NotificationType notificationType, String route);

    /**
     * Send a push notification to specific users.
     *
     * @param userIds The list of user IDs
     * @param title The notification title
     * @param body The notification body
     * @param notificationType The notification type
     * @param route Optional deep link route
     */
    void sendNotificationToUsers(
            List<Long> userIds, String title, String body, NotificationType notificationType, String route);

    /**
     * Get notification history for a specific user.
     *
     * @param userId The user ID
     * @param limit Maximum number of notifications to return (null for all)
     * @return List of notifications ordered by creation date descending
     */
    List<PushNotification> getUserNotifications(long userId, Integer limit);
}
