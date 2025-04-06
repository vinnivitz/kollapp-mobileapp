package org.kollappbackend.user.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.kollappbackend.user.application.model.AuthenticatedKollappUser;

@PrimaryPort
public interface AuthService {
    AuthenticatedKollappUser authenticate(String username, String password);

    String refresh(String token);
}
