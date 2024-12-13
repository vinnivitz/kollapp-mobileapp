package com.none.orgaappbackend.organization.application.service;

import com.none.orgaappbackend.organization.application.model.AuthenticatedOrganization;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
public interface AuthService {
    AuthenticatedOrganization authenticate(String username, String password);
}
