package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event that is fired when a member's role is changed within an organization.
 */
@Getter
@Setter
public class MemberRoleChangedEvent extends ApplicationEvent {
    private long userId;
    private long organizationId;
    private String organizationName;
    private String username;
    private OrganizationRole newRole;

    public MemberRoleChangedEvent(
            Object source,
            long userId,
            long organizationId,
            String organizationName,
            String username,
            OrganizationRole newRole) {
        super(source);
        this.userId = userId;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.username = username;
        this.newRole = newRole;
    }
}
