package org.kollappbackend.organization.application.repository;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.jmolecules.ddd.annotation.Repository;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.PersonOfOrganization;

import java.util.List;
import java.util.Optional;

@Repository
@SecondaryPort
public interface PersonOfOrganizationRepository {
    PersonOfOrganization save(PersonOfOrganization personOfOrganization);

    List<PersonOfOrganization> findByUserId(long userId);

    Optional<PersonOfOrganization> findByUserIdAndOrganization(long userId, Organization organization);

    void deleteById(long id);

    PersonOfOrganization findById(long id);
}
