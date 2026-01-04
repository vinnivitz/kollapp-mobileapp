package org.kollapp.organization.application.service.impl;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PostingDoesNotExistException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;
import org.kollapp.organization.application.model.PostingCreatedEvent;
import org.kollapp.organization.application.model.PostingDeletedEvent;
import org.kollapp.organization.application.model.PostingUpdatedEvent;
import org.kollapp.organization.application.publisher.OrganizationPublisher;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.BudgetAccountService;
import org.kollapp.user.application.model.RequiresKollappOrganizationMemberRole;

@Service
@Transactional
public class BudgetAccountServiceImpl implements BudgetAccountService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationRoleHelper organizationRoleHelper;

    @Autowired
    private OrganizationPublisher organizationPublisher;

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting addOrganizationPosting(long organizationId, OrganizationPosting posting) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        organization.getOrganizationPostings().add(posting);
        posting.setOrganization(organization);

        PostingCreatedEvent event =
                new PostingCreatedEvent(this, posting.getId(), null, organizationId, posting.getPurpose());
        organizationPublisher.publishPostingCreatedEvent(event);

        return posting;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting editOrganizationPosting(long organizationId, long postingId, OrganizationPosting updatedPosting) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        OrganizationPosting postingToBeEdited = organization.getOrganizationPostings().stream()
                .filter(f -> f.getId() == postingId)
                .findFirst()
                .orElseThrow(PostingDoesNotExistException::new);
        postingToBeEdited.setDate(updatedPosting.getDate());
        postingToBeEdited.setPurpose(updatedPosting.getPurpose());
        postingToBeEdited.setAmountInCents(updatedPosting.getAmountInCents());
        postingToBeEdited.setType(updatedPosting.getType());

        PostingUpdatedEvent event =
                new PostingUpdatedEvent(this, postingId, null, organizationId, postingToBeEdited.getPurpose());
        organizationPublisher.publishPostingUpdatedEvent(event);

        return postingToBeEdited;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteOrganizationPosting(long organizationId, long postingId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        OrganizationPosting postingToBeRemoved = organization.getOrganizationPostings().stream()
                .filter(p -> p.getId() == postingId)
                .findFirst()
                .orElseThrow(PostingDoesNotExistException::new);
        organization.getOrganizationPostings().remove(postingToBeRemoved);

        PostingDeletedEvent event =
                new PostingDeletedEvent(this, postingId, null, organizationId, postingToBeRemoved.getPurpose());
        organizationPublisher.publishPostingDeletedEvent(event);
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting addActivityPosting(long organizationId, long activityId, ActivityPosting posting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.getActivities().stream()
                .filter(a -> a.getId() == activityId)
                .findFirst()
                .orElseThrow(ActivityNotFoundException::new);
        activity.getActivityPostings().add(posting);
        posting.setActivity(activity);

        PostingCreatedEvent event =
                new PostingCreatedEvent(this, posting.getId(), activityId, organizationId, posting.getPurpose());
        organizationPublisher.publishPostingCreatedEvent(event);

        return posting;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting editActivityPosting(
            long organizationId, long activityId, long postingId, ActivityPosting updatedPosting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.getActivities().stream()
                .filter(a -> a.getId() == activityId)
                .findFirst()
                .orElseThrow(ActivityNotFoundException::new);
        ActivityPosting postingToBeEdited = activity.getActivityPostings().stream()
                .filter(p -> p.getId() == postingId)
                .findFirst()
                .orElseThrow(PostingDoesNotExistException::new);
        postingToBeEdited.setDate(updatedPosting.getDate());
        postingToBeEdited.setPurpose(updatedPosting.getPurpose());
        postingToBeEdited.setAmountInCents(updatedPosting.getAmountInCents());
        postingToBeEdited.setType(updatedPosting.getType());

        PostingUpdatedEvent event =
                new PostingUpdatedEvent(this, postingId, activityId, organizationId, postingToBeEdited.getPurpose());
        organizationPublisher.publishPostingUpdatedEvent(event);

        return postingToBeEdited;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteActivityPosting(long organizationId, long activityId, long postingId) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.getActivities().stream()
                .filter(a -> a.getId() == activityId)
                .findFirst()
                .orElseThrow(ActivityNotFoundException::new);
        ActivityPosting postingToBeRemoved = activity.getActivityPostings().stream()
                .filter(p -> p.getId() == postingId)
                .findFirst()
                .orElseThrow(PostingDoesNotExistException::new);
        activity.getActivityPostings().remove(postingToBeRemoved);

        PostingDeletedEvent event =
                new PostingDeletedEvent(this, postingId, activityId, organizationId, postingToBeRemoved.getPurpose());
        organizationPublisher.publishPostingDeletedEvent(event);
    }
}
