package com.none.kollappbackend.organization.adapters.secondary.db;

import com.none.kollappbackend.organization.adapters.secondary.db.jpa.PersonOfOrganizationJpaRepository;
import com.none.kollappbackend.organization.application.model.PersonOfOrganization;
import com.none.kollappbackend.organization.application.repository.PersonOfOrganizationRepository;
import org.jmolecules.architecture.hexagonal.SecondaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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
    public Optional<PersonOfOrganization> findByUserId(long userId) {
        return personOfOrganizationJpaRepository.findByUserId(userId);
    }

    @Override
    public void deleteById(long id) {
        personOfOrganizationJpaRepository.deleteById(id);
    }
}
