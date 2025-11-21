package org.kollapp.organization.adapters.primary.listener;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.service.OrganizationService;
import org.kollapp.user.application.model.KollappUserUpdatedEvent;

@Service
@PrimaryAdapter
public class KollappUserUpdatedListener implements ApplicationListener<KollappUserUpdatedEvent> {

    @Autowired private OrganizationService organizationService;

    @Override
    public void onApplicationEvent(KollappUserUpdatedEvent event) {
        organizationService.updatePersonOfOrganizationsOfUser(
                event.getUserId(), event.getUsername());
    }
}
