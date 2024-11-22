package com.none.orgaappbackend.organization.application;


import com.none.orgaappbackend.organization.application.model.Organization;

import java.util.Optional;

public interface OrganizationService {
    boolean isUsernameFree(String username);
    Organization getLoggedInOrganization();
    Organization getOrganizationByUsername(String username);
    Optional<Organization> getOrganizationOptionalByEmail(String email);
    void activateOrganization(String confirmationToken);
    void changePassword(String oldPassword, String newPassword);
    void resetPassword(String email);
    void register(String username, String name, String email, String password);
}
