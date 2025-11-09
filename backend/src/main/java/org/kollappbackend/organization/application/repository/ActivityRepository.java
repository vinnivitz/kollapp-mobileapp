package org.kollappbackend.organization.application.repository;

import org.kollappbackend.organization.application.model.Activity;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityRepository {
    List<Activity> getActivitiesOfOrganization(long organizationId);

    Optional<Activity> findById(long activityId);

    Activity save(Activity activity);

    Optional<Activity> findByIdAndOrganizationId(long id, long organizationId);
}
