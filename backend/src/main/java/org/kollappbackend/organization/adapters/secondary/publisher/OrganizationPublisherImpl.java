package org.kollappbackend.organization.adapters.secondary.publisher;

import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.organization.application.model.OrganizationCreatedEvent;
import org.kollappbackend.organization.application.publisher.OrganizationPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@SecondaryAdapter
@Service
@Slf4j
public class OrganizationPublisherImpl implements OrganizationPublisher {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publisherOrganizationCreatedEvent(OrganizationCreatedEvent organizationCreatedEvent) {
        log.info("[Organization] Publishing domain event: OrganizationCreatedEvent");
        applicationEventPublisher.publishEvent(organizationCreatedEvent);
    }
}
