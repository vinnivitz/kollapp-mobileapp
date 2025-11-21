package org.kollappbackend.user.application.repository;

import java.util.Optional;
import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.kollappbackend.user.application.model.KollappUser;
import org.springframework.stereotype.Repository;

@SecondaryPort
@Repository
public interface KollappUserRepository {
    Optional<KollappUser> findByUsername(String username);

    Optional<KollappUser> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    void save(KollappUser user);

    void deleteById(long id);

    Optional<KollappUser> findById(Long id);
}
