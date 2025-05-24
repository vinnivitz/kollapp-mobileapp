package org.kollappbackend.organization.application.service.impl;

import jakarta.transaction.Transactional;
import org.kollappbackend.organization.application.exception.ActivityNotFoundException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.model.Activity;
import org.kollappbackend.organization.application.model.ActivityDeletedEvent;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.publisher.OrganizationPublisher;
import org.kollappbackend.organization.application.repository.ActivityRepository;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class ActivityServiceImpl implements ActivityService {

    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private MessageSource messageSource;
    @Autowired
    private OrganizationPublisher organizationPublisher;

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
        ActivityDeletedEvent activityDeletedEvent = new ActivityDeletedEvent(this, activity.getId());
        organizationPublisher.publishActivityDeletedEvent(activityDeletedEvent);
    }
}
