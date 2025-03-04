package com.none.kollappbackend.organization.application.service;

import com.none.kollappbackend.organization.application.model.Organization;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
public interface OrganizationService {
    Organization getOrganizationByLoggedInUser();

    Organization createOrganization(Organization organization);

    Organization updateOrganization(Organization updatedOrganization);

    Organization deleteUserFromOrganization(long personOfOrganizationId);

    void leaveOrganization();
}
