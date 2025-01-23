package com.none.kollappbackend.organization.application.repository;

import com.none.kollappbackend.organization.application.model.PersonOfOrganization;
import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.jmolecules.ddd.annotation.Repository;

import java.util.Optional;

@Repository
@SecondaryPort
public interface PersonOfOrganizationRepository {
    PersonOfOrganization save(PersonOfOrganization personOfOrganization);
    Optional<PersonOfOrganization> findByUserId(long userId);
    void deleteById(long id);
}
