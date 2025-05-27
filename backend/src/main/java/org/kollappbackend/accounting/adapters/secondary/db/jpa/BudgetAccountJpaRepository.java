package org.kollappbackend.accounting.adapters.secondary.db.jpa;

import org.kollappbackend.accounting.application.model.BudgetAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BudgetAccountJpaRepository extends JpaRepository<BudgetAccount, Long> {
    Optional<BudgetAccount> findByOrganizationId(long organizationId);
    void deleteByOrganizationId(long organizationId);
}
