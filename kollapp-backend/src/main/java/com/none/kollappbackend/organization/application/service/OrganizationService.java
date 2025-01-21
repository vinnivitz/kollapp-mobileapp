package com.none.kollappbackend.organization.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;

import com.none.kollappbackend.organization.application.model.Organization;

@PrimaryPort
public interface OrganizationService {
    Organization getOrganizationById(long id);
    Organization getOrganizationByLoggedInUser();
    long createOrganization(String name);
    Organization updateOrganization(String name);
    void deleteOrganization(long id);
}
