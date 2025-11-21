package org.kollappbackend.organization.application.publisher;

import org.kollappbackend.organization.application.model.ActivityDeletedEvent;
import org.kollappbackend.organization.application.model.OrganizationCreatedEvent;
import org.kollappbackend.organization.application.model.OrganizationDeletedEvent;

public interface OrganizationPublisher {
    void publishOrganizationCreatedEvent(OrganizationCreatedEvent organizationCreatedEvent);

    void publishOrganizationDeletedEvent(OrganizationDeletedEvent organizationDeletedEvent);

    void publishActivityDeletedEvent(ActivityDeletedEvent activityDeletedEvent);
}
