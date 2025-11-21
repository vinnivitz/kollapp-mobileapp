package org.kollappbackend.organization.adapters.secondary.db;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.organization.adapters.secondary.db.jpa.OrganizationJpaRepository;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
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
    public Organization save(Organization organization) {
        return jpaRepository.save(organization);
    }

    @Override
    public void deleteById(long id) {
        jpaRepository.deleteById(id);
    }
}
