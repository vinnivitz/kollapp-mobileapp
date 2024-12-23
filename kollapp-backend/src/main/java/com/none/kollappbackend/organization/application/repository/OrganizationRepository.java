package com.none.kollappbackend.organization.application.repository;

import com.none.kollappbackend.organization.application.model.Organization;
import org.jmolecules.architecture.hexagonal.SecondaryPort;

import java.util.Optional;

@SecondaryPort
public interface OrganizationRepository {
    Optional<Organization> findByUsername(String username);
    Optional<Organization> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void save(Organization organization);
}
