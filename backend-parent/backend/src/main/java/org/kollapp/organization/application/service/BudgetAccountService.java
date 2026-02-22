package org.kollapp.organization.application.service;

import org.kollapp.organization.application.model.ActivityBudget;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationBudgetCategory;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;

public interface BudgetAccountService {

    /**
     * Creates a new organization posting. Organization members can only assign themselves to a posting.
     * Organization managers can assign all organization members to the posting.
     * @param organizationId The organization id for which the posting should be created.
     * @param posting The posting to be created.
     * @return The persisted posting.
     */
    Posting addOrganizationPosting(long organizationId, OrganizationPosting posting);

    /**
     * Updates an existing organization posting. Organization members are not allowed to update the referenced person
     * of organization. Organization managers are allowed to update the reference person of organization.
     * @param organizationId The organization id for which the posting should be updated
     * @param postingId The posting id of the posting to be updated
     * @param updatedPosting The posting to be updated
     * @return The updated posting
     */
    Posting editOrganizationPosting(long organizationId, long postingId, OrganizationPosting updatedPosting);

    /**
     * Deletes an existing organization posting. Organization members can only delete postings assigned to
     * themselves. Organization managers can delete all postings of the organization.
     * @param organizationId The organization id for which the posting should be deleted.
     * @param postingId The posting id of the posting to be deleted.
     */
    void deleteOrganizationPosting(long organizationId, long postingId);

    /**
     * Transfers an existing organization posting to the collective.
     * Deletes the reference to a person of organization.
     * @param organizationId The organization id for which the posting should be transferred.
     * @param postingId The posting to be transferred.
     * @return The transferred posting.
     */
    Posting transferOrganizationPosting(long organizationId, long postingId);

    /**
     * Creates a new activity posting. Organization members can only assign themselves to a posting.
     * Organization managers can assign all organization members to the posting.
     * @param organizationId The organization id.
     * @param activityId The activity id for which the posting should be created.
     * @param posting The posting to be created.
     * @return The persisted posting.
     */
    Posting addActivityPosting(long organizationId, long activityId, ActivityPosting posting);

    /**
     * Updates an existing activity posting. Organization members are not allowed to update the referenced person
     * of organization. Organization managers are allowed to update the referenced person of organization.
     * @param organizationId The organization id.
     * @param activityId The activity id for which the posting should be updated.
     * @param postingId The posting id of the posting to be updated
     * @param updatedPosting The posting to be updated
     * @return The updated posting
     */
    Posting editActivityPosting(long organizationId, long activityId, long postingId, ActivityPosting updatedPosting);

    /**
     * Deletes an existing activity posting. Organization members can only delete postings assigned to
     * themselves. Organization managers can delete all postings of the organization.
     * @param organizationId The organization id.
     * @param activityId The activity id for which the posting should be deleted
     * @param postingId The posting id of the posting to be deleted.
     */
    void deleteActivityPosting(long organizationId, long activityId, long postingId);

    /**
     * Transfers an existing activity posting to the collective.
     * Deletes the reference to a person of organization.
     * @param organizationId The organization id for which the posting should be transferred
     * @param activityId The activity id for which the posting should be transferred
     * @param postingId The posting to be transferred
     * @return The transferred posting.
     */
    Posting transferActivityPosting(long organizationId, long activityId, long postingId);

    /**
     * Assigns all postings of a budget category to the default budget category of the corresponding organization.
     * @param organization The organization.
     * @param sourceBudgetCategoryId The budget category to take the postings from.
     */
    void assignPostingsOfBudgetCategoryToDefaultBudgetCategory(
            Organization organization, OrganizationBudgetCategory sourceBudgetCategoryId);

    /**
     * Adds a budget mapping to an activity. A budget mapping assigns a budget to an activity regarding a budget category.
     * @param organizationId The organization id of the activity.
     * @param activityId The activity id.
     * @param budgetMapping The budget mapping to be created.
     * @return The new budget mapping.
     */
    ActivityBudget addActivityBudgetMapping(long organizationId, long activityId, ActivityBudget budgetMapping);

    /**
     * Updates an existing budget mapping.
     * @param organizationId The organization id of the activity.
     * @param activityId The activity id.
     * @param budgetId The budget mapping id to be updated.
     * @param budgetToBeUpdated The budget mapping to be updated.
     * @return The updated budget mapping.
     */
    ActivityBudget editActivityBudgetMapping(
            long organizationId, long activityId, long budgetId, ActivityBudget budgetToBeUpdated);

    /**
     * Deletes an existing budget mapping.
     * @param organizationId The organization id of the activity.
     * @param activityId The activity id.
     * @param budgetId The id of the budget mapping.
     */
    void deleteActivityBudgetMapping(long organizationId, long activityId, long budgetId);
}
