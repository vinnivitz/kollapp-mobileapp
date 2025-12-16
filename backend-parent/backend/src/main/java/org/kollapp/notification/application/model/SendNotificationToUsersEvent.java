package org.kollapp.notification.application.model;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event to trigger sending a notification to multiple users.
 */
@Getter
@Setter
public class SendNotificationToUsersEvent extends ApplicationEvent {
    private List<Long> userIds;
    private String title;
    private String body;
    private Map<String, String> data;

    public SendNotificationToUsersEvent(
            Object source, List<Long> userIds, String title, String body, Map<String, String> data) {
        super(source);
        this.userIds = userIds;
        this.title = title;
        this.body = body;
        this.data = data;
    }
}
