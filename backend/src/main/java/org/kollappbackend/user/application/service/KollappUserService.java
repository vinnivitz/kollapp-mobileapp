package org.kollappbackend.user.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.kollappbackend.user.application.model.KollappUser;
import org.springframework.lang.Nullable;

@PrimaryPort
public interface KollappUserService {
    KollappUser getLoggedInKollappUser();

    KollappUser getKollappUserByUsername(String username);

    void activateKollappUser(String confirmationToken);

    void changePassword(String oldPassword, String newPassword);

    void forgotPassword(String email);

    void resetPassword(String token, String password);

    void register(String username, String email, String password);

    KollappUser updateKollappUser(@Nullable String username, @Nullable String email);

    void deleteKollappUser();

    KollappUser findById(Long id);
}
