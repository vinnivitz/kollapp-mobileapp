package org.kollappbackend.organization.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.kollappbackend.organization.application.model.Organization;

@PrimaryPort
public interface OrganizationService {
    Organization getOrganizationByLoggedInUser();

    Organization createOrganization(Organization organization);

    Organization updateOrganization(Organization updatedOrganization);

    Organization deleteUserFromOrganization(long personOfOrganizationId);

    void leaveOrganization();
}
