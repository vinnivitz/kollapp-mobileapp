package org.kollapp.notification.application.port;

import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;
import org.kollapp.notification.application.model.enums.NotificationType;

/**
 * Port for sending push notifications through different channels.
 */
public interface PushNotificationChannel {
    /**
     * Send a push notification through this channel.
     *
     * @param deviceToken The device token to send to
     * @param title       The notification title
     * @param body        The notification body
     * @param notificationType The type of notification
     * @param route       Optional deep link route
     * @return The notification record with status
     */
    PushNotification send(
            DeviceToken deviceToken, String title, String body, NotificationType notificationType, String route);

    /**
     * Check if this channel supports the given device type.
     *
     * @param deviceToken The device token to check
     * @return true if this channel can handle the device type
     */
    boolean supports(DeviceToken deviceToken);
}
