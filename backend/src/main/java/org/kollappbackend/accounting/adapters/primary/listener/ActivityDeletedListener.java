package org.kollappbackend.accounting.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.accounting.application.service.BudgetAccountService;
import org.kollappbackend.organization.application.model.ActivityDeletedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

@Service
@PrimaryAdapter
@Slf4j
public class ActivityDeletedListener implements ApplicationListener<ActivityDeletedEvent> {

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Override
    public void onApplicationEvent(ActivityDeletedEvent event) {
        log.info("[Accounting] Received domain event: ActivityDeletedEvent");
        budgetAccountService.deletePostingsOfActivity(event.getActivityId());
    }
}
