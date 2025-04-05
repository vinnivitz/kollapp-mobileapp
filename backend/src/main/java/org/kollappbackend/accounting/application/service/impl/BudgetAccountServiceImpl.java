package org.kollappbackend.accounting.application.service.impl;

import org.kollappbackend.accounting.application.exception.NoPostingWithThisIdException;
import org.kollappbackend.accounting.application.exception.OrganizationHasNoBudgetAccount;
import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.kollappbackend.accounting.application.model.Posting;
import org.kollappbackend.accounting.application.repository.BudgetAccountRepository;
import org.kollappbackend.accounting.application.repository.PostingRepository;
import org.kollappbackend.accounting.application.service.BudgetAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetAccountServiceImpl implements BudgetAccountService {
    @Autowired
    private BudgetAccountRepository budgetAccountRepository;

    @Autowired
    private PostingRepository postingRepository;

    public BudgetAccount save(BudgetAccount budgetAccount) {
        return budgetAccountRepository.save(budgetAccount);
    }

    @Override
    public Posting addPosting(Posting posting, long organizationId) {
        BudgetAccount budgetAccount = getBudgetAccountByOrganizationId(organizationId);
        budgetAccount.addPosting(posting);
        posting.setBudgetAccount(budgetAccount);
        return postingRepository.save(posting);
    }

    @Override
    public Posting editPosting(Posting updatedPosting, long postingId) {
        Posting posting = postingRepository.findById(postingId).orElseThrow(NoPostingWithThisIdException::new);
        posting.setDate(updatedPosting.getDate());
        posting.setPurpose(updatedPosting.getPurpose());
        posting.setAmountInCents(updatedPosting.getAmountInCents());
        return posting;
    }

    @Override
    public void deletePosting(long postingId) {
        postingRepository.deleteById(postingId);
    }

    public List<Posting> getPostingsOfBudgetAccountOfOrganizationId(long organizationId) {
        BudgetAccount budgetAccount = getBudgetAccountByOrganizationId(organizationId);
        return budgetAccount.getPostings();
    }

    private BudgetAccount getBudgetAccountByOrganizationId(long organizationId) {
        return budgetAccountRepository
                .findByOrganizationId(organizationId)
                .orElseThrow(OrganizationHasNoBudgetAccount::new);
    }
}
