package com.none.orgaappbackend.organization.adapters.secondary.db.jpa;

import com.none.orgaappbackend.organization.application.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationJpaRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByUsername(String username);
    Optional<Organization> findByEmail(String email);
    boolean existsByUsername(String username);
}
