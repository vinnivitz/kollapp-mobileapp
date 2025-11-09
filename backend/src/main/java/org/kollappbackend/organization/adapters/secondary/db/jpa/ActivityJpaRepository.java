package org.kollappbackend.organization.adapters.secondary.db.jpa;

import org.kollappbackend.organization.application.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityJpaRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByOrganizationId(long organizationId);

    Optional<Activity> findByIdAndOrganizationId(long id, long organizationId);
}
