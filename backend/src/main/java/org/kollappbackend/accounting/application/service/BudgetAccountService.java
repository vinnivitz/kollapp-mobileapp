package org.kollappbackend.accounting.application.service;

import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.kollappbackend.accounting.application.model.Posting;

public interface BudgetAccountService {
    Posting addPosting(Posting posting, long budgetAccountId);

    Posting editPosting(Posting postingToBeEdited, long postingId, long budgetAccountId);

    void deletePosting(long accountId, long postingId);

    BudgetAccount getBudgetAccountByOrganizationId(long organizationId);

    void createBudgetAccount(Long organizationId);

    void deleteBudgetAccount(long organizationId);

    void deletePostingsOfActivity(long activityId);
}
