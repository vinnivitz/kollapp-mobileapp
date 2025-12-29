package org.kollapp.notification.application.port;

import java.util.Map;

import org.kollapp.notification.application.model.entities.DeviceToken;
import org.kollapp.notification.application.model.entities.PushNotification;

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
     * @param data        Optional additional data
     * @return The notification record with status
     */
    PushNotification send(DeviceToken deviceToken, String title, String body, Map<String, String> data);

    /**
     * Check if this channel supports the given device type.
     *
     * @param deviceToken The device token to check
     * @return true if this channel can handle the device type
     */
    boolean supports(DeviceToken deviceToken);

    /**
     * Get the channel name for identification.
     *
     * @return The channel name
     */
    String getChannelName();
}
