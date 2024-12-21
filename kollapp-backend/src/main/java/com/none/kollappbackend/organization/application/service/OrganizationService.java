package com.none.kollappbackend.organization.application.service;


import com.none.kollappbackend.organization.application.model.Organization;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

import java.util.Optional;

@PrimaryPort
public interface OrganizationService {
    Organization getLoggedInOrganization();
    Organization getOrganizationByUsername(String username);
    Optional<Organization> getOrganizationOptionalByEmail(String email);
    void activateOrganization(String confirmationToken);
    void changePassword(String oldPassword, String newPassword);
    void resetPassword(String email);
    void register(String username, String name, String email, String password);
}
