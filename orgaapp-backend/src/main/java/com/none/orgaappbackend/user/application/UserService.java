package com.none.orgaappbackend.user.application;


import com.none.orgaappbackend.user.application.model.User;

import java.util.Optional;

public interface UserService {
    long addUserWithAdminRole(String username, String name, String surname, String email, String password);
    boolean isUsernameFree(String username);
    User getLoggedInUser();
    User getUserByUsername(String username);
    Optional<User> getUserOptionalByEmailAndUsername(String email, String username);
    void activateUser(String confirmationToken);
}
