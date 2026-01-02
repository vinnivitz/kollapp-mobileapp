package org.kollapp.notification.application.model.events;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

import org.kollapp.notification.application.model.enums.NotificationType;

/**
 * Event to trigger sending a notification to multiple users.
 */
@Getter
@Setter
public class SendNotificationToUsersEvent extends ApplicationEvent {
    private List<Long> userIds;
    private String title;
    private String body;
    private NotificationType notificationType;
    private String route;

    public SendNotificationToUsersEvent(
            Object source,
            List<Long> userIds,
            String title,
            String body,
            NotificationType notificationType,
            String route) {
        super(source);
        this.userIds = userIds;
        this.title = title;
        this.body = body;
        this.notificationType = notificationType;
        this.route = route;
    }
}
