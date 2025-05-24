package org.kollappbackend.accounting.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.accounting.application.service.BudgetAccountService;
import org.kollappbackend.organization.application.model.OrganizationCreatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

@PrimaryAdapter
@Service
@Slf4j
public class OrganizationCreatedListener implements ApplicationListener<OrganizationCreatedEvent> {

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Override
    public void onApplicationEvent(OrganizationCreatedEvent event) {
        log.info("[Accounting] Received domain event: OrganizationCreatedEvent");
        budgetAccountService.createBudgetAccount(event.getOrganizationId());
    }
}
