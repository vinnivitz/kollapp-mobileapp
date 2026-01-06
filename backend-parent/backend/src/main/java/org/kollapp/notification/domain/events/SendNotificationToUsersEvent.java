package org.kollapp.notification.domain.events;

import java.util.List;

import lombok.Value;

import org.kollapp.notification.domain.enums.NotificationType;

/**
 * Event to trigger sending a notification to multiple users.
 */
@Value
public class SendNotificationToUsersEvent {
    private List<Long> userIds;
    private String title;
    private String body;
    private NotificationType notificationType;
    private String route;
}
