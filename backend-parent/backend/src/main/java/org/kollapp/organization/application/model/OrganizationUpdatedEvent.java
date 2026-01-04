package org.kollapp.organization.application.model;

import lombok.Getter;
import lombok.Setter;

import org.springframework.context.ApplicationEvent;

/**
 * Event that is fired when an organization is updated.
 */
@Getter
@Setter
public class OrganizationUpdatedEvent extends ApplicationEvent {
    private long organizationId;
    private String organizationName;

    public OrganizationUpdatedEvent(Object source, long organizationId, String organizationName) {
        super(source);
        this.organizationId = organizationId;
        this.organizationName = organizationName;
    }
}
