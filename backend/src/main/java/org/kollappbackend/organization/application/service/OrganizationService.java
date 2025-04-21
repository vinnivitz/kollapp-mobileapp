package org.kollappbackend.organization.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.kollappbackend.organization.application.model.Organization;

import java.util.List;

@PrimaryPort
public interface OrganizationService {
    List<Organization> getOrganizationsByLoggedInUser();

    Organization getOrganizationById(long id);

    Organization createOrganization(Organization organization);

    Organization updateOrganization(Organization updatedOrganization, long organizationId);

    Organization deleteUserFromOrganization(long personOfOrganizationId, long organizationId);

    void deleteUserFromAllOrganizations(long personOfOrganizationId);

    void leaveOrganization(long organizationId);
}
