package org.kollapp.organization.adapters.primary.listener;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.service.OrganizationService;
import org.kollapp.user.application.model.KollappUserDeletedEvent;

@PrimaryAdapter
@Service
@Slf4j
public class KollappUserDeletedListener implements ApplicationListener<KollappUserDeletedEvent> {

    @Autowired private OrganizationService organizationService;

    @Override
    public void onApplicationEvent(KollappUserDeletedEvent kollappUserDeletedEvent) {
        log.info("[Organization] Received domain event: UserDeletedEvent");
        organizationService.deleteUserFromAllOrganizations(kollappUserDeletedEvent.getUserId());
    }
}
