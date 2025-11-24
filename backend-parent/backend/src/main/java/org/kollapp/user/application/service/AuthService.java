package org.kollapp.user.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;

import org.kollapp.user.application.model.AuthenticatedKollappUser;

@PrimaryPort
public interface AuthService {
    AuthenticatedKollappUser authenticate(String username, String password);

    String refresh(String token);
}
