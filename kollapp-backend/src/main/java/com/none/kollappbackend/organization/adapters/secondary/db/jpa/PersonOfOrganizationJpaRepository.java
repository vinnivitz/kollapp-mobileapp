package com.none.kollappbackend.organization.adapters.secondary.db.jpa;

import com.none.kollappbackend.organization.application.model.PersonOfOrganization;
import org.jmolecules.ddd.annotation.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@Repository
public interface PersonOfOrganizationJpaRepository extends JpaRepository<PersonOfOrganization, Long> {
    Optional<PersonOfOrganization> findByUserId(long userId);
}
