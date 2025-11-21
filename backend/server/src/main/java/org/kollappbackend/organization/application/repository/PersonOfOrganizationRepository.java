package org.kollappbackend.organization.application.repository;

import java.util.List;
import java.util.Optional;
import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.jmolecules.ddd.annotation.Repository;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.PersonOfOrganization;

@Repository
@SecondaryPort
public interface PersonOfOrganizationRepository {
    PersonOfOrganization save(PersonOfOrganization personOfOrganization);

    List<PersonOfOrganization> findByUserId(long userId);

    Optional<PersonOfOrganization> findByUserIdAndOrganization(
            long userId, Organization organization);

    void deleteById(long id);

    Optional<PersonOfOrganization> findById(long id);

    Optional<PersonOfOrganization> findByIdAndOrganization(long id, Organization organization);
}
