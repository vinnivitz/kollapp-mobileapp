package org.kollapp.organization.adapters.secondary.db;

import java.util.Optional;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import org.kollapp.organization.adapters.secondary.db.jpa.OrganizationJpaRepository;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.repository.OrganizationRepository;

@Repository
@SecondaryAdapter
public class OrganizationRepositoryImpl implements OrganizationRepository {
    @Autowired private OrganizationJpaRepository jpaRepository;

    @Override
    public Optional<Organization> findById(long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Organization save(Organization organization) {
        return jpaRepository.save(organization);
    }

    @Override
    public void deleteById(long id) {
        jpaRepository.deleteById(id);
    }
}
