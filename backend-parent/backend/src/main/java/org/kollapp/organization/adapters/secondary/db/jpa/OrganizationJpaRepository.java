package org.kollapp.organization.adapters.secondary.db.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.kollapp.organization.application.model.Organization;

@Repository
public interface OrganizationJpaRepository extends JpaRepository<Organization, Long> {}
