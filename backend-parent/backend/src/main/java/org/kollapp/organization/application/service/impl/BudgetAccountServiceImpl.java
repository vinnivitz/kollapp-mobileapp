package org.kollapp.organization.application.service.impl;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.kollapp.organization.application.exception.OrganizationAuthorizationException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.ReimbursementNotPossibleException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.model.Posting;
import org.kollapp.organization.application.model.PostingType;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.BudgetAccountService;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.RequiresKollappOrganizationMemberRole;
import org.kollapp.user.application.service.KollappUserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class BudgetAccountServiceImpl implements BudgetAccountService {

    private final OrganizationRepository organizationRepository;

    private final OrganizationRoleHelper organizationRoleHelper;

    private final KollappUserService kollappUserService;

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting addOrganizationPosting(long organizationId, OrganizationPosting posting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        checkOrganizationMemberSelfAssignment(organization, posting);
        List<Long> personOfOrganizationIdsOfOrganization = organization.getPersonOfOrganizationIds();
        if (!personOfOrganizationIdsOfOrganization.contains(posting.getPersonOfOrganizationId())) {
            throw new PersonNotRegisteredInOrganizationException();
        }
        organization.getOrganizationPostings().add(posting);
        posting.setOrganization(organization);
        return posting;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting editOrganizationPosting(long organizationId, long postingId, OrganizationPosting updatedPosting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        OrganizationPosting postingToBeEdited = organization.getOrganizationPostingById(postingId);
        return updatePosting(organization, postingToBeEdited, updatedPosting);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteOrganizationPosting(long organizationId, long postingId) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        OrganizationPosting postingToBeRemoved = organization.getOrganizationPostingById(postingId);
        checkOrganizationMemberSelfAssignment(organization, postingToBeRemoved);
        organization.getOrganizationPostings().remove(postingToBeRemoved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting reimburseOrganizationPosting(long organizationId, long postingId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
            .findById(organizationId)
            .orElseThrow(OrganizationNotFoundException::new);
        OrganizationPosting organizationPosting = organization.getOrganizationPostingById(postingId);
        checkPostingReimbursability(organizationPosting);
        organizationPosting.reimburse();
        return organizationPosting;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting addActivityPosting(long organizationId, long activityId, ActivityPosting posting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.getActivityById(activityId);
        checkOrganizationMemberSelfAssignment(organization, posting);
        List<Long> personOfOrganizationIdsOfOrganization = organization.getPersonOfOrganizationIds();
        if (!personOfOrganizationIdsOfOrganization.contains(posting.getPersonOfOrganizationId())) {
            throw new PersonNotRegisteredInOrganizationException();
        }
        activity.getActivityPostings().add(posting);
        posting.setActivity(activity);
        return posting;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting editActivityPosting(
            long organizationId, long activityId, long postingId, ActivityPosting updatedPosting) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.getActivityById(activityId);
        ActivityPosting postingToBeEdited = activity.getActivityPostingById(postingId);
        return updatePosting(organization, postingToBeEdited, updatedPosting);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteActivityPosting(long organizationId, long activityId, long postingId) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        Organization organization =
                organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.getActivityById(activityId);
        ActivityPosting postingToBeRemoved = activity.getActivityPostingById(postingId);
        checkOrganizationMemberSelfAssignment(organization, postingToBeRemoved);
        activity.getActivityPostings().remove(postingToBeRemoved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting reimburseActivityPosting(long organizationId, long activityId, long postingId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
            .findById(organizationId)
            .orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.getActivityById(activityId);
        ActivityPosting activityPosting = activity.getActivityPostingById(postingId);
        checkPostingReimbursability(activityPosting);
        activityPosting.reimburse();
        return activityPosting;
    }

    /**
     * Checks if a posting is suitable for reimbursement. A posting can only be reimbursed if it is a credit posting
     * and not already reimbursed.
     * @param posting The posting to be reimbursed.
     */
    private void checkPostingReimbursability(Posting posting) {
        if (posting.getType().equals(PostingType.CREDIT)
            || posting.getPersonOfOrganizationId() == 0) {
            throw new ReimbursementNotPossibleException();
        }
    }

    /**
     * Checks if a posting is assigned to the logged in organization member.
     * @param organization The organization
     * @param posting The posting
     * @throws OrganizationAuthorizationException if the posting is not self-assigned to the logged in organization
     * member.
     */
    private void checkOrganizationMemberSelfAssignment(Organization organization, Posting posting) {
        KollappUser loggedInKollappUser = kollappUserService.getLoggedInKollappUser();
        PersonOfOrganization loggedInPersonOfOrganization =
            organization.getPersonOfOrganizationByUserId(loggedInKollappUser.getId());
        boolean postingIsSelfAssigned = posting.getPersonOfOrganizationId() == loggedInPersonOfOrganization.getId();
        if (loggedInPersonOfOrganization.isMember()
            && !postingIsSelfAssigned) {
            throw new OrganizationAuthorizationException();
        }
    }

    /**
     * Updates the fields of a posting. The person of organization reference can only be edited by organization
     * managers if the new referenced member is still part of the organization.
     * @param organization The organization.
     * @param postingToBeEdited The posting to be edited.
     * @param updatedPosting The posting containing the updated attributes.
     * @return The updated posting.
     * @throws PersonNotRegisteredInOrganizationException If the new referenced
     * person of organization is not part of the organization.
     * @throws UnsupportedOperationException If the id of the reference person of organization is set to zero. The posting
     * reimbursement method has to be used instead.
     */
    private Posting updatePosting(Organization organization, Posting postingToBeEdited, Posting updatedPosting) {
        checkOrganizationMemberSelfAssignment(organization, updatedPosting);
        if (postingToBeEdited.getPersonOfOrganizationId() != updatedPosting.getPersonOfOrganizationId()
            && updatedPosting.getPersonOfOrganizationId() == 0) {
            throw new UnsupportedOperationException();
        }
        postingToBeEdited.setDate(updatedPosting.getDate());
        postingToBeEdited.setPurpose(updatedPosting.getPurpose());
        postingToBeEdited.setAmountInCents(updatedPosting.getAmountInCents());
        postingToBeEdited.setType(updatedPosting.getType());
        List<Long> personOfOrganizationIdsOfOrganization = organization.getPersonOfOrganizationIds();
        if (personOfOrganizationIdsOfOrganization.contains(postingToBeEdited.getPersonOfOrganizationId())) {
            postingToBeEdited.setPersonOfOrganizationId(updatedPosting.getPersonOfOrganizationId());
            return postingToBeEdited;
        }
        throw new PersonNotRegisteredInOrganizationException();
    }

}
