package org.kollapp.notification.application.model;

import java.util.List;
import java.util.Map;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event to trigger sending a notification to all members of an organization.
 * Contains the user IDs to avoid cross-module service dependencies.
 */
@Getter
@Setter
public class SendNotificationToOrganizationEvent extends ApplicationEvent {
    private Long organizationId;
    private List<Long> userIds;
    private String title;
    private String body;
    private Map<String, String> data;

    public SendNotificationToOrganizationEvent(
            Object source,
            Long organizationId,
            List<Long> userIds,
            String title,
            String body,
            Map<String, String> data) {
        super(source);
        this.organizationId = organizationId;
        this.userIds = userIds;
        this.title = title;
        this.body = body;
        this.data = data;
    }
}
