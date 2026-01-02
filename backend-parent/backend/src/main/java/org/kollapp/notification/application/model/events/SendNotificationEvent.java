package org.kollapp.notification.application.model.events;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

import org.kollapp.notification.application.model.enums.NotificationType;

/**
 * Event to trigger sending a notification to a specific user.
 */
@Getter
@Setter
public class SendNotificationEvent extends ApplicationEvent {
    private long userId;
    private String title;
    private String body;
    private NotificationType notificationType;
    private String route;

    public SendNotificationEvent(
            Object source, long userId, String title, String body, NotificationType notificationType, String route) {
        super(source);
        this.userId = userId;
        this.title = title;
        this.body = body;
        this.notificationType = notificationType;
        this.route = route;
    }
}
