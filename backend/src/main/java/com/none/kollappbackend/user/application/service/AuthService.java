package com.none.kollappbackend.user.application.service;

import com.none.kollappbackend.user.application.model.AuthenticatedKollappUser;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
public interface AuthService {
    AuthenticatedKollappUser authenticate(String username, String password);

    String refresh(String token);
}
