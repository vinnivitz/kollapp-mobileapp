package com.none.kollappbackend.user.application.service;

import com.none.kollappbackend.user.application.model.AuthenticatedKollappUser;
import jakarta.transaction.Transactional;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
@Transactional
public interface AuthService {
    AuthenticatedKollappUser authenticate(String username, String password);
    String refresh(String token);
}
