package org.kollapp.organization.application.service;

import java.util.List;

import org.jmolecules.architecture.hexagonal.PrimaryPort;

import org.kollapp.organization.application.model.Activity;

@PrimaryPort
public interface ActivityService {
    List<Activity> getActivitiesOfOrganization(long organizationId);

    Activity createActivityForOrganization(long organizationId, Activity activity);

    Activity updateActivity(long organizationId, long activityId, Activity activity);

    void deleteActivity(long organizationId, long activityId);
}
