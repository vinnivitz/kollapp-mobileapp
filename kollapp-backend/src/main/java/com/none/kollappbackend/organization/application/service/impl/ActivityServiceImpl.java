package com.none.kollappbackend.organization.application.service.impl;
import com.none.kollappbackend.organization.application.exception.ActivityNotFoundException;
import com.none.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import com.none.kollappbackend.organization.application.model.Activity;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.repository.ActivityRepository;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.service.ActivityService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
@Transactional
public class ActivityServiceImpl implements ActivityService {

    private ActivityRepository activityRepository;
    private OrganizationRepository organizationRepository;
    private MessageSource messageSource;

    @Override
    public List<Activity> getActivitiesOfOrganization(long organizationId) {
        return activityRepository.getActivitiesOfOrganization(organizationId);
    }

    @Override
    public Activity createActivityForOrganization(long organizationId, Activity activity) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        Activity newActivity = activityRepository.save(activity);
        newActivity.setOrganization(organization);
        organization.addActivityOfOrganization(newActivity);
        return newActivity;
    }

    @Override
    public Activity updateActivity(long organizationId, long activityId, Activity activity) {
        Activity activityToBeUpdated = activityRepository.findById(activityId)
                .orElseThrow(() -> new ActivityNotFoundException(messageSource));
        activityToBeUpdated.setName(activity.getName());
        activityToBeUpdated.setLocation(activity.getLocation());
        return activityToBeUpdated;
    }
}
