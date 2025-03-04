package com.none.kollappbackend.user.application.service;

import com.none.kollappbackend.user.application.model.ERole;
import com.none.kollappbackend.user.application.model.KollappUser;
import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.springframework.lang.Nullable;

import java.util.List;

@PrimaryPort
public interface KollappUserService {
    KollappUser getLoggedInKollappUser();

    KollappUser getKollappUserByUsername(String username);

    KollappUser getKollappUserByEmail(String email);

    void activateKollappUser(String confirmationToken);

    void changePassword(String oldPassword, String newPassword);

    void forgotPassword(String email);

    void resetPassword(String token, String password);

    void register(String username, String email, String password, String name, String surname, List<ERole> roles);

    KollappUser updateKollappUser(@Nullable String username, @Nullable String email, @Nullable String surname,
                                  @Nullable String name);

    void deleteKollappUser();
}
