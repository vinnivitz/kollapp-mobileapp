package org.kollappbackend.organization.application.service;

import org.jmolecules.architecture.hexagonal.PrimaryPort;
import org.kollappbackend.organization.application.model.Activity;

import java.util.List;

@PrimaryPort
public interface ActivityService {
    List<Activity> getActivitiesOfOrganization(long organizationId);

    Activity createActivityForOrganization(long organizationId, Activity activity);

    Activity updateActivity(long organizationId, long activityId, Activity activity);

    void deleteActivity(long organizationId, long activityId);

}
