package org.kollapp.user.adapters.secondary.db;

import java.util.Optional;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import org.kollapp.user.adapters.secondary.db.jpa.KollappUserJpaRepository;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.repository.KollappUserRepository;

@Repository
@SecondaryAdapter
public class KollappUserRepositoryImpl implements KollappUserRepository {
    @Autowired private KollappUserJpaRepository jpaRepository;

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

    @Override
    public Optional<KollappUser> findById(Long id) {
        return jpaRepository.findById(id);
    }
}
