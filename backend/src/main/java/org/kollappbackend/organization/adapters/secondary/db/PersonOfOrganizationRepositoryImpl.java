package org.kollappbackend.organization.adapters.secondary.db;

import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.kollappbackend.organization.adapters.secondary.db.jpa.PersonOfOrganizationJpaRepository;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.repository.PersonOfOrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Repository;

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
    public Optional<PersonOfOrganization> findByUserId(long userId) {
        return personOfOrganizationJpaRepository.findByUserId(userId);
    }

    @Override
    public void deleteById(long id) {
        personOfOrganizationJpaRepository.deleteById(id);
    }

    @Override
    public PersonOfOrganization findById(long id) {
        return personOfOrganizationJpaRepository.findById(id)
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
    }
}
