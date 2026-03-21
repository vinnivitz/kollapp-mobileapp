package org.kollapp.organization.application.service.impl;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.kollapp.organization.application.exception.BudgetCategoryIsNotAssignableException;
import org.kollapp.organization.application.exception.BudgetExceedException;
import org.kollapp.organization.application.exception.OrganizationAuthorizationException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PostingIsAlreadyTransferredException;
import org.kollapp.organization.application.exception.PostingTransferNotPossibleException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.ActivityBudget;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationBudgetCategory;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.model.Posting;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.BudgetAccountService;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.RequiresKollappOrganizationMemberRole;
import org.kollapp.user.application.service.KollappUserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        long budgetCategoryId = getAssignableBudgetCategory(organization, posting);
        posting.setOrganizationBudgetCategoryId(budgetCategoryId);
        List<Long> personOfOrganizationIdsOfOrganization = organization.getPersonOfOrganizationIds();
        if (posting.getPersonOfOrganizationId() == 0
            || personOfOrganizationIdsOfOrganization.contains(posting.getPersonOfOrganizationId())) {
            organization.getOrganizationPostings().add(posting);
            posting.setOrganization(organization);
            return posting;
        }
        throw new PersonNotRegisteredInOrganizationException();
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
        OrganizationPosting postingToBeEdited = organization.findOrganizationPostingById(postingId);
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
        OrganizationPosting postingToBeRemoved = organization.findOrganizationPostingById(postingId);
        checkOrganizationMemberSelfAssignment(organization, postingToBeRemoved);
        organization.getOrganizationPostings().remove(postingToBeRemoved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting transferOrganizationPosting(long organizationId, long postingId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        OrganizationPosting organizationPosting = organization.findOrganizationPostingById(postingId);
        checkPostingTransferability(organizationPosting);
        organizationPosting.transfer();
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
        Activity activity = organization.findActivityById(activityId);
        checkOrganizationMemberSelfAssignment(organization, posting);
        long budgetCategoryId = getAssignableBudgetCategory(organization, posting);
        OrganizationBudgetCategory budgetCategory = organization.findBudgetCategoryById(budgetCategoryId);
        List<ActivityPosting> allActivityPostings = activity.getActivityPostings();
        allActivityPostings.add(posting);
        if (budgetExceeded(activity, budgetCategory, allActivityPostings)) {
            throw new BudgetExceedException();
        }
        posting.setOrganizationBudgetCategoryId(budgetCategoryId);
        List<Long> personOfOrganizationIdsOfOrganization = organization.getPersonOfOrganizationIds();
        if (!personOfOrganizationIdsOfOrganization.contains(posting.getPersonOfOrganizationId())) {
            throw new PersonNotRegisteredInOrganizationException();
        }
        activity.getActivityPostings().add(posting);
        posting.setActivity(activity);
        activity.calculateCurrentlyUsedBudget();
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
        Activity activity = organization.findActivityById(activityId);
        ActivityPosting postingToBeEdited = activity.getActivityPostingById(postingId);
        long budgetCategoryId = getAssignableBudgetCategory(organization, postingToBeEdited);
        OrganizationBudgetCategory budgetCategory = organization.findBudgetCategoryById(budgetCategoryId);
        List<ActivityPosting> postingsAfterEdit = activity.getActivityPostings();
        postingsAfterEdit.set(postingsAfterEdit.indexOf(postingToBeEdited), updatedPosting);
        if (budgetExceeded(activity, budgetCategory, postingsAfterEdit)) {
            throw new BudgetExceedException();
        }
        Posting persistedPosting = updatePosting(organization, postingToBeEdited, updatedPosting);
        activity.calculateCurrentlyUsedBudget();
        return persistedPosting;
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
        Activity activity = organization.findActivityById(activityId);
        ActivityPosting postingToBeRemoved = activity.getActivityPostingById(postingId);
        checkOrganizationMemberSelfAssignment(organization, postingToBeRemoved);
        activity.getActivityPostings().remove(postingToBeRemoved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public Posting transferActivityPosting(long organizationId, long activityId, long postingId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.findActivityById(activityId);
        ActivityPosting activityPosting = activity.getActivityPostingById(postingId);
        checkPostingTransferability(activityPosting);
        activityPosting.transfer();
        return activityPosting;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public void assignPostingsOfBudgetCategoryToDefaultBudgetCategory(
        Organization organization, OrganizationBudgetCategory sourceBudgetCategory) {
        List<Posting> postingsOfCategory =
            organization.findAllOrganizationAndActivityPostingsByBudgetCategoryId(sourceBudgetCategory.getId());
        OrganizationBudgetCategory defaultCategory = organization.findDefaultBudgetCategory();
        postingsOfCategory.forEach(posting -> {
            posting.setOrganizationBudgetCategoryId(defaultCategory.getId());
        });
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public ActivityBudget addActivityBudgetMapping(long organizationId, long activityId, ActivityBudget budgetMapping) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.findActivityById(activityId);
        budgetMapping.setActivity(activity);
        activity.getActivityCategoryBudgets().add(budgetMapping);
        return budgetMapping;
    }


    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public ActivityBudget editActivityBudgetMapping(
        long organizationId, long activityId, long budgetId, ActivityBudget budgetToBeUpdated) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.findActivityById(activityId);
        ActivityBudget budgetMapping = activity.getActivityBudgetById(budgetId);
        budgetMapping.setLimitSet(budgetToBeUpdated.isLimitSet());
        budgetMapping.setBudget(budgetToBeUpdated.getBudget());
        return budgetMapping;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteActivityBudgetMapping(long organizationId, long activityId, long budgetId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = organization.findActivityById(activityId);
        ActivityBudget budgetMapping = activity.getActivityBudgetById(budgetId);
        activity.getActivityCategoryBudgets().remove(budgetMapping);
    }

    /**
     * Checks if a posting is suitable for transfer. A posting can only be transferred if it has a
     * reference to a person of organization.
     *
     * @param posting The posting to be transferred.
     */
    private void checkPostingTransferability(Posting posting) {
        if (posting.getPersonOfOrganizationId() == 0) {
            throw new PostingTransferNotPossibleException();
        }
    }

    /**
     * Checks if a posting is assigned to the logged in organization member.
     *
     * @param organization The organization
     * @param posting      The posting
     * @throws OrganizationAuthorizationException if the posting is not self-assigned to the logged in organization
     *                                            member.
     */
    private void checkOrganizationMemberSelfAssignment(Organization organization, Posting posting) {
        KollappUser loggedInKollappUser = kollappUserService.getLoggedInKollappUser();
        PersonOfOrganization loggedInPersonOfOrganization =
            organization.findPersonOfOrganizationByUserId(loggedInKollappUser.getId());
        boolean postingIsSelfAssigned = posting.getPersonOfOrganizationId() == loggedInPersonOfOrganization.getId();
        if (loggedInPersonOfOrganization.isMember() && !postingIsSelfAssigned) {
            throw new OrganizationAuthorizationException();
        }
    }

    /**
     * Updates the fields of a posting. The person of organization reference can only be edited by organization
     * managers if the new referenced member is still part of the organization.
     *
     * @param organization      The organization.
     * @param postingToBeEdited The posting to be edited.
     * @param updatedPosting    The posting containing the updated attributes.
     * @return The updated posting.
     * @throws PersonNotRegisteredInOrganizationException If the new referenced
     *                                                    person of organization is not part of the organization.
     * @throws PostingIsAlreadyTransferredException       If the id of the reference person of organization is set to zero. The posting
     *                                                    transfer method has to be used instead.
     */
    private Posting updatePosting(Organization organization, Posting postingToBeEdited, Posting updatedPosting) {
        // check the existing posting
        checkOrganizationMemberSelfAssignment(organization, postingToBeEdited);
        // check the updated posting
        checkOrganizationMemberSelfAssignment(organization, updatedPosting);

        List<Long> personOfOrganizationIdsOfOrganization = organization.getPersonOfOrganizationIds();
        if ((postingToBeEdited.getPersonOfOrganizationId() != updatedPosting.getPersonOfOrganizationId())
            && !personOfOrganizationIdsOfOrganization.contains(updatedPosting.getPersonOfOrganizationId())) {
            throw new PersonNotRegisteredInOrganizationException();
        }
        if (postingToBeEdited.getPersonOfOrganizationId() == 0 && updatedPosting.getPersonOfOrganizationId() != 0) {
            throw new PostingIsAlreadyTransferredException();
        }
        long budgetCategoryId = getAssignableBudgetCategory(organization, updatedPosting);
        postingToBeEdited.setDate(updatedPosting.getDate());
        postingToBeEdited.setPurpose(updatedPosting.getPurpose());
        postingToBeEdited.setAmountInCents(updatedPosting.getAmountInCents());
        postingToBeEdited.setType(updatedPosting.getType());
        postingToBeEdited.setPersonOfOrganizationId(updatedPosting.getPersonOfOrganizationId());
        postingToBeEdited.setOrganizationBudgetCategoryId(budgetCategoryId);
        return postingToBeEdited;
    }

    /**
     * Get the assignable budget category for the posting. The provided budget category id is assignable
     * if it is part of the same organization as the posting. If no budget category id is provided
     * the posting is assigned to the default budget category of the organization.
     */
    private long getAssignableBudgetCategory(Organization organization, Posting posting) {
        boolean budgetCategoryIdIsProvided = posting.getOrganizationBudgetCategoryId() != 0;
        if (!budgetCategoryIdIsProvided) {
            return organization.findDefaultBudgetCategory().getId();
        }
        List<Long> budgetCategoryIdsOfOrganization = organization.getBudgetCategoryIds();
        boolean categoryIsAssignable =
            budgetCategoryIdsOfOrganization.contains(posting.getOrganizationBudgetCategoryId());
        if (!categoryIsAssignable) {
            throw new BudgetCategoryIsNotAssignableException();
        }
        return posting.getOrganizationBudgetCategoryId();
    }

    private boolean budgetExceeded(Activity activity, OrganizationBudgetCategory budgetCategory, List<ActivityPosting> postings) {
        long alreadyUsedBudgetOfCategory = postings.stream()
            .filter(p -> p.getOrganizationBudgetCategoryId() == budgetCategory.getId())
            .mapToLong(Posting::getAmountInCents).sum();
        Optional<ActivityBudget> budgetMappingForCategory = activity.getActivityCategoryBudgets()
            .stream()
            .filter(m -> m.getBudgetCategoryId() == budgetCategory.getId()).findFirst();
        if (budgetMappingForCategory.isPresent() && budgetMappingForCategory.get().isLimitSet()) {
            long limit = budgetMappingForCategory.get().getBudget();
            return alreadyUsedBudgetOfCategory > limit;
        }
        return false;
    }
}
