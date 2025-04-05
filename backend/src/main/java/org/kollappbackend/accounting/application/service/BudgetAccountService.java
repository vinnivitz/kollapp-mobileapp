package org.kollappbackend.accounting.application.service;

import org.kollappbackend.accounting.application.model.Posting;

import java.util.List;

public interface BudgetAccountService {
    Posting addPosting(Posting posting, long organizationId);
    Posting editPosting(Posting posting, long organizationId);
    void deletePosting(long postingId);
    List<Posting> getPostingsOfBudgetAccountOfOrganizationId(long organizationId);
}
