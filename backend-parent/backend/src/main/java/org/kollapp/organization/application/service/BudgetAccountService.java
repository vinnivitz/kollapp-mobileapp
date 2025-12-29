package org.kollapp.organization.application.service;

import org.kollapp.organization.application.model.ActivityPosting;
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
    Posting editActivityPosting(
            long organizationId, long activityId, long postingId, ActivityPosting updatedPosting);

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
}
