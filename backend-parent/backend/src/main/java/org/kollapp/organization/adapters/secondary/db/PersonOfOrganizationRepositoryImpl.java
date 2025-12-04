package org.kollapp.organization.adapters.secondary.db;

import java.util.List;
import java.util.Optional;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import org.kollapp.organization.adapters.secondary.db.jpa.PersonOfOrganizationJpaRepository;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationRole;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.repository.PersonOfOrganizationRepository;

@SecondaryAdapter
@Repository
public class PersonOfOrganizationRepositoryImpl implements PersonOfOrganizationRepository {

    @Autowired
    private PersonOfOrganizationJpaRepository personOfOrganizationJpaRepository;

    @Override
    public PersonOfOrganization save(PersonOfOrganization personOfOrganization) {
        return personOfOrganizationJpaRepository.save(personOfOrganization);
    }

    @Override
    public List<PersonOfOrganization> findByUserId(long userId) {
        return personOfOrganizationJpaRepository.findByUserId(userId);
    }

    @Override
    public Optional<PersonOfOrganization> findByUserIdAndOrganization(long userId, Organization organization) {
        return personOfOrganizationJpaRepository.findByUserIdAndOrganization(userId, organization);
    }

    @Override
    public void deleteById(long id) {
        personOfOrganizationJpaRepository.deleteById(id);
    }

    @Override
    public Optional<PersonOfOrganization> findById(long id) {
        return personOfOrganizationJpaRepository.findById(id);
    }

    @Override
    public Optional<PersonOfOrganization> findByIdAndOrganization(long id, Organization organization) {
        return personOfOrganizationJpaRepository.findByIdAndOrganization(id, organization);
    }

    @Override
    public long countByUserId(long userId) {
        return personOfOrganizationJpaRepository.countByUserId(userId);
    }

    @Override
    public long countByUserIdAndOrganizationRole(long userId, OrganizationRole organizationRole) {
        return personOfOrganizationJpaRepository.countByUserIdAndOrganizationRole(userId, organizationRole);
    }
}
