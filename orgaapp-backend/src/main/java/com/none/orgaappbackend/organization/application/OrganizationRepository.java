package com.none.orgaappbackend.organization.application;

import com.none.orgaappbackend.organization.application.model.Organization;

import java.util.Optional;

public interface OrganizationRepository {
    Optional<Organization> findById(long id);
    Optional<Organization> findByUsername(String username);
    Optional<Organization> findByEmail(String email);
    boolean existsByUsername(String username);
    Organization save(Organization organization);
}
