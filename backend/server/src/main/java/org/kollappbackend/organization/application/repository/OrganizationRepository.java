package org.kollappbackend.organization.application.repository;

import java.util.Optional;
import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.kollappbackend.organization.application.model.Organization;

@SecondaryPort
public interface OrganizationRepository {
    Optional<Organization> findById(long id);

    Organization save(Organization organization);

    void deleteById(long id);
}
