package com.none.kollappbackend.organization.adapters.secondary.db;

import com.none.kollappbackend.organization.adapters.secondary.db.jpa.OrganizationJpaRepository;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@SecondaryAdapter
public class OrganizationRepositoryImpl implements OrganizationRepository {
    @Autowired
    private OrganizationJpaRepository jpaRepository;

    @Override
    public Optional<Organization> findById(long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Optional<Organization> findByUsername(String username) {
        return jpaRepository.findByUsername(username);
    }

    @Override
    public Optional<Organization> findByEmail(String email) {
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
    public Organization save(Organization organization) {
        return jpaRepository.save(organization);
    }
}
