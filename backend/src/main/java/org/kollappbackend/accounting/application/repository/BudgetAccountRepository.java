package org.kollappbackend.accounting.application.repository;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@SecondaryPort
@Repository
public interface BudgetAccountRepository {
    BudgetAccount save(BudgetAccount budgetAccount);

    Optional<BudgetAccount> findByOrganizationId(long organizationId);

    Optional<BudgetAccount> findById(long id);
}
