package com.none.kollappbackend.organization.adapters.secondary.db.jpa;

import com.none.kollappbackend.organization.application.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityJpaRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByOrganizationId(Long organizationId);
}
