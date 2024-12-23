package com.none.kollappbackend.organization.application.service;

import com.none.kollappbackend.organization.application.model.Organization;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
public interface OrganizationService {
    Organization getLoggedInOrganization();

    Organization getOrganizationByUsername(String username);

    Organization getOrganizationOptionalByEmail(String email);

    void activateOrganization(String confirmationToken);

    void changePassword(String oldPassword, String newPassword);

    void forgotPassword(String email);

    void resetPassword(String token, String password);

    void register(String username, String email, String password);
}
