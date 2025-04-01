package org.kollappbackend.organization.application.repository;

import org.jmolecules.architecture.hexagonal.SecondaryPort;
import org.kollappbackend.organization.application.model.Organization;

import java.util.Optional;

@SecondaryPort
public interface OrganizationRepository {
    Optional<Organization> findById(long id);

    Organization save(Organization organization);

    void deleteById(long id);
}
