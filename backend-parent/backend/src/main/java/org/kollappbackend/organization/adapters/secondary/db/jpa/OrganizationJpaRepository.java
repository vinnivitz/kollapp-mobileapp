package org.kollappbackend.organization.adapters.secondary.db.jpa;

import org.kollappbackend.organization.application.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationJpaRepository extends JpaRepository<Organization, Long> {
}
