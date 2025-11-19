package org.kollappbackend.organization.adapters.secondary.db.jpa;

import org.jmolecules.ddd.annotation.Repository;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonOfOrganizationJpaRepository extends JpaRepository<PersonOfOrganization, Long> {
    List<PersonOfOrganization> findByUserId(long userId);

    Optional<PersonOfOrganization> findByUserIdAndOrganization(long userId, Organization organization);

    Optional<PersonOfOrganization> findByIdAndOrganization(long id, Organization organization);
}
