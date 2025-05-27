package org.kollappbackend.accounting.application.service.impl;

import jakarta.transaction.Transactional;
import org.kollappbackend.accounting.application.exception.BudgetAccountDoesNotContainPostingException;
import org.kollappbackend.accounting.application.exception.BudgetAccountDoesNotExistException;
import org.kollappbackend.accounting.application.exception.PostingDoesNotExistException;
import org.kollappbackend.accounting.application.exception.OrganizationHasNoBudgetAccount;
import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.kollappbackend.accounting.application.model.Posting;
import org.kollappbackend.accounting.application.repository.BudgetAccountRepository;
import org.kollappbackend.accounting.application.repository.PostingRepository;
import org.kollappbackend.accounting.application.service.BudgetAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class BudgetAccountServiceImpl implements BudgetAccountService {
    @Autowired
    private BudgetAccountRepository budgetAccountRepository;

    @Autowired
    private PostingRepository postingRepository;

    public BudgetAccount save(BudgetAccount budgetAccount) {
        return budgetAccountRepository.save(budgetAccount);
    }

    @Override
    public Posting addPosting(Posting posting, long budgetAccountId) {
        BudgetAccount budgetAccount =
                budgetAccountRepository.findById(budgetAccountId).orElseThrow(BudgetAccountDoesNotExistException::new);
        budgetAccount.addPosting(posting);
        posting.setBudgetAccount(budgetAccount);
        return postingRepository.save(posting);
    }

    @Override
    public Posting editPosting(Posting postingToBeEdited, long postingId, long budgetAccountId) {
        BudgetAccount budgetAccount = budgetAccountRepository.findById(budgetAccountId)
                .orElseThrow(BudgetAccountDoesNotExistException::new);
        Posting posting = postingRepository.findById(postingId).orElseThrow(PostingDoesNotExistException::new);
        if (!budgetAccount.containsPosting(posting)) {
            throw new BudgetAccountDoesNotContainPostingException();
        }
        posting.setDate(postingToBeEdited.getDate());
        posting.setPurpose(postingToBeEdited.getPurpose());
        posting.setAmountInCents(postingToBeEdited.getAmountInCents());
        return posting;
    }

    @Override
    public void deletePosting(long budgetAccountId, long postingId) {
        BudgetAccount budgetAccount = budgetAccountRepository.findById(budgetAccountId)
                .orElseThrow(BudgetAccountDoesNotExistException::new);
        Posting posting = postingRepository.findById(postingId).orElseThrow(PostingDoesNotExistException::new);
        if (!budgetAccount.containsPosting(posting)) {
            throw new BudgetAccountDoesNotContainPostingException();
        }
        budgetAccount.deletePosting(posting);
    }

    @Override
    public BudgetAccount getBudgetAccountByOrganizationId(long organizationId) {
        return budgetAccountRepository
                .findByOrganizationId(organizationId)
                .orElseThrow(OrganizationHasNoBudgetAccount::new);
    }

    @Override
    public void createBudgetAccount(Long organizationId) {
        BudgetAccount budgetAccount = BudgetAccount.builder().organizationId(organizationId).build();
        budgetAccountRepository.save(budgetAccount);
    }

    @Override
    public void deleteBudgetAccount(long organizationId) {
        budgetAccountRepository.deleteByOrganizationId(organizationId);
    }

    @Override
    public void deletePostingsOfActivity(long activityId) {
        postingRepository.deleteByActivityId(activityId);
    }
}
