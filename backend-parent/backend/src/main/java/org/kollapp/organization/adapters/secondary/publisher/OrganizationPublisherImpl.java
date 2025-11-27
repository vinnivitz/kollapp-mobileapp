package org.kollapp.organization.adapters.secondary.publisher;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.model.ActivityDeletedEvent;
import org.kollapp.organization.application.model.OrganizationCreatedEvent;
import org.kollapp.organization.application.model.OrganizationDeletedEvent;
import org.kollapp.organization.application.publisher.OrganizationPublisher;

@SecondaryAdapter
@Service
@Slf4j
public class OrganizationPublisherImpl implements OrganizationPublisher {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publishOrganizationCreatedEvent(OrganizationCreatedEvent organizationCreatedEvent) {
        log.info("[Organization] Publishing domain event: OrganizationCreatedEvent");
        applicationEventPublisher.publishEvent(organizationCreatedEvent);
    }

    @Override
    public void publishOrganizationDeletedEvent(OrganizationDeletedEvent organizationDeletedEvent) {
        log.info("[Organization] Publishing domain event: OrganizationDeletedEvent");
        applicationEventPublisher.publishEvent(organizationDeletedEvent);
    }

    @Override
    public void publishActivityDeletedEvent(ActivityDeletedEvent activityDeletedEvent) {
        log.info("[Organization] Publishing domain event: ActivityDeletedEvent");
        applicationEventPublisher.publishEvent(activityDeletedEvent);
    }
}
