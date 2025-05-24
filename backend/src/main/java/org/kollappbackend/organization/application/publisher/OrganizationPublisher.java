package org.kollappbackend.organization.application.publisher;

import org.kollappbackend.organization.application.model.OrganizationCreatedEvent;

public interface OrganizationPublisher {
    void publisherOrganizationCreatedEvent(OrganizationCreatedEvent organizationCreatedEvent);
}
