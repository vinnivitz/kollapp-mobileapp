package com.none.kollappbackend.organization.application.service;

import com.none.kollappbackend.organization.application.model.PersonOfOrganization;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

import com.none.kollappbackend.organization.application.model.Organization;

@PrimaryPort
public interface OrganizationService {
    Organization getOrganizationByLoggedInUser();
    Organization createOrganization(Organization organization);
    Organization updateOrganization(Organization updatedOrganization);
    Organization deleteUserFromOrganization(long personOfOrganizationId);
    void leaveOrganization();
}
