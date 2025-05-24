package org.kollappbackend.accounting.adapters.secondary.db;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.accounting.adapters.secondary.db.jpa.BudgetAccountJpaRepository;
import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.kollappbackend.accounting.application.repository.BudgetAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@SecondaryAdapter
public class BudgetAccountRepositoryImpl implements BudgetAccountRepository {

    @Autowired
    private BudgetAccountJpaRepository budgetAccountJpaRepository;

    @Override
    public BudgetAccount save(BudgetAccount budgetAccount) {
        return budgetAccountJpaRepository.save(budgetAccount);
    }

    @Override
    public Optional<BudgetAccount> findByOrganizationId(long organizationId) {
        return budgetAccountJpaRepository.findByOrganizationId(organizationId);
    }

    @Override
    public Optional<BudgetAccount> findById(long id) {
        return budgetAccountJpaRepository.findById(id);
    }

    @Override
    public void deleteByOrganizationId(long id) {
        budgetAccountJpaRepository.deleteByOrganizationId(id);
    }
}
