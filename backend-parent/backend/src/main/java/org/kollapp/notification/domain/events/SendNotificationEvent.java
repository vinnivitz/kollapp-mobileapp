package org.kollapp.notification.domain.events;

import lombok.Value;

import org.kollapp.notification.domain.enums.NotificationType;

/**
 * Event to trigger sending a notification to a specific user.
 */
@Value
public class SendNotificationEvent {
    private long userId;
    private String title;
    private String body;
    private NotificationType notificationType;
    private String route;
}
