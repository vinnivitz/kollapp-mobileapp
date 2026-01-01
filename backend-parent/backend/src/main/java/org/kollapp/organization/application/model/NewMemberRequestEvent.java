package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event that is fired when a new member requests to join an organization.
 */
@Getter
@Setter
public class NewMemberRequestEvent extends ApplicationEvent {
    private long userId;
    private long organizationId;
    private String organizationName;
    private String username;

    public NewMemberRequestEvent(
            Object source, long userId, long organizationId, String organizationName, String username) {
        super(source);
        this.userId = userId;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.username = username;
    }
}
