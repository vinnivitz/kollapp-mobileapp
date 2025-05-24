package org.kollappbackend.organization.application.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;

@Getter
@Setter
public class OrganizationDeletedEvent extends ApplicationEvent {
    private long organizationId;

    public OrganizationDeletedEvent(Object source, long organizationId) {
        super(source);
        this.organizationId = organizationId;
    }
}
