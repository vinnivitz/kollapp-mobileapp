package com.none.kollappbackend.organization.application.service;
import com.none.kollappbackend.organization.application.model.Activity;
import org.jmolecules.architecture.hexagonal.PrimaryPort;

import java.util.List;

@PrimaryPort
public interface ActivityService {
    List<Activity> getActivitiesOfOrganization(long organizationId);
    Activity createActivityForOrganization(long organizationId, Activity activity);
    Activity updateActivity(long organizationId, long activityId, Activity activity);

}
