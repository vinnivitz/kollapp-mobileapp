package org.kollappbackend.organization.application.service.impl;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.kollappbackend.organization.application.exception.ActivityNotFoundException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.model.Activity;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.repository.ActivityRepository;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.service.ActivityService;
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
        activity.setOrganization(organization);
        activityRepository.save(activity);
        organization.addActivityOfOrganization(activity);
        return activity;
    }

    @Override
    public Activity updateActivity(long organizationId, long activityId, Activity activity) {
        Activity activityToBeUpdated =
                activityRepository.findById(activityId).orElseThrow(() -> new ActivityNotFoundException(messageSource));
        activityToBeUpdated.setName(activity.getName());
        activityToBeUpdated.setLocation(activity.getLocation());
        return activityToBeUpdated;
    }

    @Override
    public void deleteActivity(long organizationId, long activityId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        Activity activity =
                organization.getActivities().stream().filter(activity1 -> activity1.getId() == activityId).findFirst()
                        .orElseThrow(() -> new ActivityNotFoundException(messageSource));
        organization.getActivities().remove(activity);
    }
}
