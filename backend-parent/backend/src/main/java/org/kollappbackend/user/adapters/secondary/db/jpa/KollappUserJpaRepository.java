package org.kollappbackend.user.adapters.secondary.db.jpa;

import org.kollappbackend.user.application.model.KollappUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KollappUserJpaRepository extends JpaRepository<KollappUser, Long> {
    Optional<KollappUser> findByUsername(String username);

    Optional<KollappUser> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
