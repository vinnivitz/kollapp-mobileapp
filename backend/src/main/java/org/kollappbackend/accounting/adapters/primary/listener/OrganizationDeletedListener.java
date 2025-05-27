package org.kollappbackend.accounting.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.accounting.application.service.BudgetAccountService;
import org.kollappbackend.organization.application.model.OrganizationDeletedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

@Service
@PrimaryAdapter
@Slf4j
public class OrganizationDeletedListener implements ApplicationListener<OrganizationDeletedEvent> {

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Override
    public void onApplicationEvent(OrganizationDeletedEvent event) {
        log.info("[Accounting] Received domain event: OrganizationDeletedEvent");
        budgetAccountService.deleteBudgetAccount(event.getOrganizationId());
    }
}
