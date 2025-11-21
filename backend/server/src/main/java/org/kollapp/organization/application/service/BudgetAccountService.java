package org.kollapp.organization.application.service;

import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;

public interface BudgetAccountService {
    Posting addOrganizationPosting(long organizationId, OrganizationPosting posting);

    Posting addActivityPosting(long organizationId, long activityId, ActivityPosting posting);

    Posting editOrganizationPosting(
            long organizationId, long postingId, OrganizationPosting postingToBeEdited);

    Posting editActivityPosting(
            long organizationId,
            long activityId,
            long postingId,
            ActivityPosting postingToBeEdited);

    void deleteOrganizationPosting(long organizationId, long postingId);

    void deleteActivityPosting(long organizationId, long activityId, long postingId);
}
