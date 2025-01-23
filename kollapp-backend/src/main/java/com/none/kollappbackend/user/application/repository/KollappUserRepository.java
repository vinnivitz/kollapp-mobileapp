package com.none.kollappbackend.user.application.repository;

import com.none.kollappbackend.user.application.model.KollappUser;
import org.jmolecules.architecture.hexagonal.SecondaryPort;

import java.util.Optional;

@SecondaryPort
public interface KollappUserRepository {
    Optional<KollappUser> findByUsername(String username);
    Optional<KollappUser> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void save(KollappUser user);
    void deleteById(long id);
}
