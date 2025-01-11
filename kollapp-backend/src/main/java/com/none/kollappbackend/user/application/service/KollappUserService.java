package com.none.kollappbackend.user.application.service;

import com.none.kollappbackend.user.application.model.KollappUser;
import com.none.kollappbackend.user.application.model.Organization;
import jakarta.transaction.Transactional;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

@PrimaryPort
@Transactional
public interface KollappUserService {
    KollappUser getLoggedInKollappUser();

    KollappUser getKollappUserByUsername(String username);

    KollappUser getKollappUserByEmail(String email);

    void activateKollappUser(String confirmationToken);

    void changePassword(String oldPassword, String newPassword);

    void forgotPassword(String email);

    void resetPassword(String token, String password);

    void register(String username, String email, String password);
}
