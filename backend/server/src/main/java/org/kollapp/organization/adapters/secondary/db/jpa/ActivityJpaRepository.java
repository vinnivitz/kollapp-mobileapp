package org.kollapp.organization.adapters.secondary.db.jpa;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.kollapp.organization.application.model.Activity;

@Repository
public interface ActivityJpaRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByOrganizationId(long organizationId);

    Optional<Activity> findByIdAndOrganizationId(long id, long organizationId);
}
