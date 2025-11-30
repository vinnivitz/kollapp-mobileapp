package org.kollapp.organization.application.publisher;

import org.kollapp.organization.application.model.ActivityDeletedEvent;
import org.kollapp.organization.application.model.OrganizationCreatedEvent;
import org.kollapp.organization.application.model.OrganizationDeletedEvent;

public interface OrganizationPublisher {
    void publishOrganizationCreatedEvent(OrganizationCreatedEvent organizationCreatedEvent);

    void publishOrganizationDeletedEvent(OrganizationDeletedEvent organizationDeletedEvent);

    void publishActivityDeletedEvent(ActivityDeletedEvent activityDeletedEvent);
}
