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
    public boolean existsById(long id) {
        return jpaRepository.existsById(id);
    }

    @Override
    public void save(Organization organization) {
        jpaRepository.save(organization);
    }

    @Override
    public void deleteById(long id) {
        jpaRepository.deleteById(id);
    }
}
