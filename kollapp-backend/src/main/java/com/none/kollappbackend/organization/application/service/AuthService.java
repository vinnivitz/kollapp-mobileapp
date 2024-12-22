package com.none.kollappbackend.organization.application.service;

import com.none.kollappbackend.organization.application.model.AuthenticatedOrganization;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
public interface AuthService {
    AuthenticatedOrganization authenticate(String username, String password);
    String refresh(String token);
}
