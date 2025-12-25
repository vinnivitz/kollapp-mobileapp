package org.kollapp.user.adapters.secondary.db.jpa;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.kollapp.user.application.model.KollappUser;

@Repository
public interface KollappUserJpaRepository extends JpaRepository<KollappUser, Long> {
    Optional<KollappUser> findByUsername(String username);

    Optional<KollappUser> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPendingEmail(String email);
}
