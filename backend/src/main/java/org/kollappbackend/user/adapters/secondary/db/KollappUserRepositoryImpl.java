package org.kollappbackend.user.adapters.secondary.db;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.user.adapters.secondary.db.jpa.KollappUserJpaRepository;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.repository.KollappUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@SecondaryAdapter
public class KollappUserRepositoryImpl implements KollappUserRepository {
    @Autowired
    private KollappUserJpaRepository jpaRepository;

    @Override
    public Optional<KollappUser> findByUsername(String username) {
        return jpaRepository.findByUsername(username);
    }

    @Override
    public Optional<KollappUser> findByEmail(String email) {
        return jpaRepository.findByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return jpaRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public void save(KollappUser user) {
        jpaRepository.save(user);
    }

    @Override
    public void deleteById(long id) {
        jpaRepository.deleteById(id);
    }
}
