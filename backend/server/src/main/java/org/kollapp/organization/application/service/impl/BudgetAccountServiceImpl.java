package org.kollapp.organization.application.service.impl;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PostingDoesNotExistException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.BudgetAccountService;
import org.kollapp.user.application.model.RequiresKollappOrganizationMemberRole;

@Service
@Transactional
public class BudgetAccountServiceImpl implements BudgetAccountService {

    @Autowired private OrganizationRepository organizationRepository;

    @Autowired private OrganizationRoleHelper organizationRoleHelper;

    @Autowired private MessageSource messageSource;

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting addOrganizationPosting(long organizationId, OrganizationPosting posting) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        organization.getOrganizationPostings().add(posting);
        posting.setOrganization(organization);
        return posting;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting editOrganizationPosting(
            long organizationId, long postingId, OrganizationPosting updatedPosting) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        OrganizationPosting postingToBeEdited =
                organization.getOrganizationPostings().stream()
                        .filter(f -> f.getId() == postingId)
                        .findFirst()
                        .orElseThrow(PostingDoesNotExistException::new);
        postingToBeEdited.setDate(updatedPosting.getDate());
        postingToBeEdited.setPurpose(updatedPosting.getPurpose());
        postingToBeEdited.setAmountInCents(updatedPosting.getAmountInCents());
        postingToBeEdited.setType(updatedPosting.getType());
        return postingToBeEdited;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteOrganizationPosting(long organizationId, long postingId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        OrganizationPosting postingToBeRemoved =
                organization.getOrganizationPostings().stream()
                        .filter(p -> p.getId() == postingId)
                        .findFirst()
                        .orElseThrow(PostingDoesNotExistException::new);
        organization.getOrganizationPostings().remove(postingToBeRemoved);
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting addActivityPosting(
            long organizationId, long activityId, ActivityPosting posting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        Activity activity =
                organization.getActivities().stream()
                        .filter(a -> a.getId() == activityId)
                        .findFirst()
                        .orElseThrow(() -> new ActivityNotFoundException(messageSource));
        activity.getActivityPostings().add(posting);
        posting.setActivity(activity);
        return posting;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting editActivityPosting(
            long organizationId, long activityId, long postingId, ActivityPosting updatedPosting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        Activity activity =
                organization.getActivities().stream()
                        .filter(a -> a.getId() == activityId)
                        .findFirst()
                        .orElseThrow(() -> new ActivityNotFoundException(messageSource));
        ActivityPosting postingToBeEdited =
                activity.getActivityPostings().stream()
                        .filter(p -> p.getId() == postingId)
                        .findFirst()
                        .orElseThrow(PostingDoesNotExistException::new);
        postingToBeEdited.setDate(updatedPosting.getDate());
        postingToBeEdited.setPurpose(updatedPosting.getPurpose());
        postingToBeEdited.setAmountInCents(updatedPosting.getAmountInCents());
        postingToBeEdited.setType(updatedPosting.getType());
        return postingToBeEdited;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteActivityPosting(long organizationId, long activityId, long postingId) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository
                        .findById(organizationId)
                        .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        Activity activity =
                organization.getActivities().stream()
                        .filter(a -> a.getId() == activityId)
                        .findFirst()
                        .orElseThrow(() -> new ActivityNotFoundException(messageSource));
        ActivityPosting postingToBeRemoved =
                activity.getActivityPostings().stream()
                        .filter(p -> p.getId() == postingId)
                        .findFirst()
                        .orElseThrow(PostingDoesNotExistException::new);
        activity.getActivityPostings().remove(postingToBeRemoved);
    }
}
