package org.kollapp.organization.application.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import org.kollapp.organization.application.model.Activity;

@Repository
public interface ActivityRepository {
    List<Activity> getActivitiesOfOrganization(long organizationId);

    Optional<Activity> findById(long activityId);

    Activity save(Activity activity);

    Optional<Activity> findByIdAndOrganizationId(long id, long organizationId);
}
