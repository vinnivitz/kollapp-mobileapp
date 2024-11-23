package com.none.orgaappbackend.organization.application.repository;

import com.none.orgaappbackend.organization.application.model.Organization;
import org.jmolecules.architecture.hexagonal.SecondaryPort;

import java.util.Optional;

@SecondaryPort
public interface OrganizationRepository {
    Optional<Organization> findById(long id);
    Optional<Organization> findByUsername(String username);
    Optional<Organization> findByEmail(String email);
    boolean existsByUsername(String username);
    void save(Organization organization);
}
