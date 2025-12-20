package org.kollapp.user.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;

import org.kollapp.user.application.model.AuthTokens;

@PrimaryPort
public interface AuthService {
    AuthTokens authenticate(String username, String password);

    String refresh(String token);
}
