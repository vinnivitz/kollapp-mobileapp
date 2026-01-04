package org.kollapp.organization.adapters.secondary.publisher;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.model.ActivityCreatedEvent;
import org.kollapp.organization.application.model.ActivityDeletedEvent;
import org.kollapp.organization.application.model.ActivityUpdatedEvent;
import org.kollapp.organization.application.model.MemberRoleChangedEvent;
import org.kollapp.organization.application.model.MembershipApprovedEvent;
import org.kollapp.organization.application.model.NewMemberRequestEvent;
import org.kollapp.organization.application.model.OrganizationCreatedEvent;
import org.kollapp.organization.application.model.OrganizationDeletedEvent;
import org.kollapp.organization.application.model.OrganizationUpdatedEvent;
import org.kollapp.organization.application.model.PostingCreatedEvent;
import org.kollapp.organization.application.model.PostingDeletedEvent;
import org.kollapp.organization.application.model.PostingUpdatedEvent;
import org.kollapp.organization.application.publisher.OrganizationPublisher;

@SecondaryAdapter
@Service
@Slf4j
public class OrganizationPublisherImpl implements OrganizationPublisher {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    @Override
    public void publishOrganizationCreatedEvent(OrganizationCreatedEvent organizationCreatedEvent) {
        applicationEventPublisher.publishEvent(organizationCreatedEvent);
    }

    @Override
    public void publishOrganizationUpdatedEvent(OrganizationUpdatedEvent organizationUpdatedEvent) {
        applicationEventPublisher.publishEvent(organizationUpdatedEvent);
    }

    @Override
    public void publishOrganizationDeletedEvent(OrganizationDeletedEvent organizationDeletedEvent) {
        applicationEventPublisher.publishEvent(organizationDeletedEvent);
    }

    @Override
    public void publishActivityCreatedEvent(ActivityCreatedEvent activityCreatedEvent) {
        applicationEventPublisher.publishEvent(activityCreatedEvent);
    }

    @Override
    public void publishActivityUpdatedEvent(ActivityUpdatedEvent activityUpdatedEvent) {
        applicationEventPublisher.publishEvent(activityUpdatedEvent);
    }

    @Override
    public void publishActivityDeletedEvent(ActivityDeletedEvent activityDeletedEvent) {
        applicationEventPublisher.publishEvent(activityDeletedEvent);
    }

    @Override
    public void publishPostingCreatedEvent(PostingCreatedEvent postingCreatedEvent) {
        applicationEventPublisher.publishEvent(postingCreatedEvent);
    }

    @Override
    public void publishPostingUpdatedEvent(PostingUpdatedEvent postingUpdatedEvent) {
        applicationEventPublisher.publishEvent(postingUpdatedEvent);
    }

    @Override
    public void publishPostingDeletedEvent(PostingDeletedEvent postingDeletedEvent) {
        applicationEventPublisher.publishEvent(postingDeletedEvent);
    }

    @Override
    public void publishMembershipApprovedEvent(MembershipApprovedEvent membershipApprovedEvent) {
        applicationEventPublisher.publishEvent(membershipApprovedEvent);
    }

    @Override
    public void publishMemberRoleChangedEvent(MemberRoleChangedEvent memberRoleChangedEvent) {
        applicationEventPublisher.publishEvent(memberRoleChangedEvent);
    }

    @Override
    public void publishNewMemberRequestEvent(NewMemberRequestEvent newMemberRequestEvent) {
        applicationEventPublisher.publishEvent(newMemberRequestEvent);
    }
}
