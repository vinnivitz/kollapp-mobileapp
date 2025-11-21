package org.kollapp.organization.adapters.secondary.db.jpa;

import java.util.List;
import java.util.Optional;

import org.jmolecules.ddd.annotation.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.PersonOfOrganization;

@Repository
public interface PersonOfOrganizationJpaRepository
        extends JpaRepository<PersonOfOrganization, Long> {
    List<PersonOfOrganization> findByUserId(long userId);

    Optional<PersonOfOrganization> findByUserIdAndOrganization(
            long userId, Organization organization);

    Optional<PersonOfOrganization> findByIdAndOrganization(long id, Organization organization);
}
