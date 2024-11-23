package com.none.orgaappbackend.organization.application.service;

import com.none.orgaappbackend.organization.adapters.primary.rest.model.LoginResponse;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
public interface AuthService {
    LoginResponse authenticate(String username, String password);
}
