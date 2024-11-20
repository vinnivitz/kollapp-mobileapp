package com.none.orgaappbackend.user.application;

import com.none.orgaappbackend.user.application.model.User;

import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(long id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailAndUsername(String username, String email);
    boolean existsByUsername(String username);
    User save(User user);
}
