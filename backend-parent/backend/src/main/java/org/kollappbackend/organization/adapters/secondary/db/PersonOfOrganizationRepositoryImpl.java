package org.kollappbackend.organization.adapters.secondary.db;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.organization.adapters.secondary.db.jpa.PersonOfOrganizationJpaRepository;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.repository.PersonOfOrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@SecondaryAdapter
@Repository
public class PersonOfOrganizationRepositoryImpl implements PersonOfOrganizationRepository {

    @Autowired
    private PersonOfOrganizationJpaRepository personOfOrganizationJpaRepository;

    private MessageSource messageSource;

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
}
