package org.kollapp.notification.application.port.secondary;

import org.jmolecules.architecture.hexagonal.SecondaryPort;

import org.kollapp.notification.domain.entities.DeviceToken;
import org.kollapp.notification.domain.enums.NotificationType;
import org.kollapp.notification.domain.model.PushNotificationSendResult;

/**
 * Port for sending push notifications through different channels.
 */
@SecondaryPort
public interface PushNotificationChannel {
    /**
     * Send a push notification through this channel.
     *
     * @param deviceToken The device token to send to
     * @param title       The notification title
     * @param body        The notification body
     * @param notificationType The type of notification
     * @param route       Optional deep link route
     * @return The send result (status + optional error)
     */
    PushNotificationSendResult send(
            DeviceToken deviceToken, String title, String body, NotificationType notificationType, String route);

    /**
     * Check if this channel supports the given device type.
     *
     * @param deviceToken The device token to check
     * @return true if this channel can handle the device type
     */
    boolean supports(DeviceToken deviceToken);
}
