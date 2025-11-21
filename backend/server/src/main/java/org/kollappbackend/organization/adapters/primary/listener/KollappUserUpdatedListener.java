package org.kollappbackend.organization.adapters.primary.listener;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.kollappbackend.user.application.model.KollappUserUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;

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
