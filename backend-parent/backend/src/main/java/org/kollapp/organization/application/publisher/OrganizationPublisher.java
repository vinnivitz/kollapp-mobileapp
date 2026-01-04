package org.kollapp.organization.application.publisher;

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

public interface OrganizationPublisher {
    void publishOrganizationCreatedEvent(OrganizationCreatedEvent organizationCreatedEvent);

    void publishOrganizationUpdatedEvent(OrganizationUpdatedEvent organizationUpdatedEvent);

    void publishOrganizationDeletedEvent(OrganizationDeletedEvent organizationDeletedEvent);

    void publishActivityCreatedEvent(ActivityCreatedEvent activityCreatedEvent);

    void publishActivityUpdatedEvent(ActivityUpdatedEvent activityUpdatedEvent);

    void publishActivityDeletedEvent(ActivityDeletedEvent activityDeletedEvent);

    void publishPostingCreatedEvent(PostingCreatedEvent postingCreatedEvent);

    void publishPostingUpdatedEvent(PostingUpdatedEvent postingUpdatedEvent);

    void publishPostingDeletedEvent(PostingDeletedEvent postingDeletedEvent);

    void publishMembershipApprovedEvent(MembershipApprovedEvent membershipApprovedEvent);

    void publishMemberRoleChangedEvent(MemberRoleChangedEvent memberRoleChangedEvent);

    void publishNewMemberRequestEvent(NewMemberRequestEvent newMemberRequestEvent);
}
