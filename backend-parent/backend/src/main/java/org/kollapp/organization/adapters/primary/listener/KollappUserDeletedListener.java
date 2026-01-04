package org.kollapp.organization.adapters.primary.listener;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.service.OrganizationService;
import org.kollapp.user.application.model.KollappUserDeletedEvent;

@PrimaryAdapter
@Service
@Slf4j
@AllArgsConstructor
public class KollappUserDeletedListener implements ApplicationListener<KollappUserDeletedEvent> {

    private final OrganizationService organizationService;

    @Override
    public void onApplicationEvent(KollappUserDeletedEvent kollappUserDeletedEvent) {
        organizationService.deleteUserFromAllOrganizations(kollappUserDeletedEvent.getUserId());
    }
}
