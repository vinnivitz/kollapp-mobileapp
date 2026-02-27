package org.kollapp.user.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.springframework.lang.Nullable;

import org.kollapp.user.application.model.KollappUser;

@PrimaryPort
public interface KollappUserService {
    KollappUser getLoggedInKollappUser();

    KollappUser getKollappUserByUsername(String username);

    void activateKollappUser(String confirmationToken);

    void confirmNewEmail(String confirmationToken);

    void changePassword(String oldPassword, String newPassword);

    void forgotPassword(String email);

    void resetPassword(String token, String password);

    void register(String username, String email, String password);

    void resendConfirmationMail(String email);

    KollappUser updateKollappUser(@Nullable String username, @Nullable String email);

    void deleteKollappUser(String password);

    KollappUser findById(Long id);
}
