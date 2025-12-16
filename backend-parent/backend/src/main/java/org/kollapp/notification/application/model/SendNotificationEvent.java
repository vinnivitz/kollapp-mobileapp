package org.kollapp.notification.application.model;

import java.util.Map;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event to trigger sending a notification to a specific user.
 */
@Getter
@Setter
public class SendNotificationEvent extends ApplicationEvent {
    private Long userId;
    private String title;
    private String body;
    private Map<String, String> data;

    public SendNotificationEvent(Object source, Long userId, String title, String body, Map<String, String> data) {
        super(source);
        this.userId = userId;
        this.title = title;
        this.body = body;
        this.data = data;
    }
}
