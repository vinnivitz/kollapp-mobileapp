package com.none.kollappbackend.organization.adapters.primary.listener;

import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.user.application.model.KollappUserDeletedEvent;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

@PrimaryAdapter
@Service
@Slf4j
public class KollappUserDeletedListener implements ApplicationListener<KollappUserDeletedEvent> {

    @Autowired
    private OrganizationService organizationService;

    @Override
    public void onApplicationEvent(KollappUserDeletedEvent kollappUserDeletedEvent) {
        log.info("[Organization] Received domain event: UserDeletedEvent");
        organizationService.deleteUserFromOrganization(kollappUserDeletedEvent.getUserId());
    }
}
