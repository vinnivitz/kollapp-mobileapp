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
import org.kollappbackend.user.application.model.RequiresKollappOrganizationMemberRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
    @Autowired
    private OrganizationRoleHelper organizationRoleHelper;

    @Override
    @RequiresKollappOrganizationMemberRole
    public List<Activity> getActivitiesOfOrganization(long organizationId) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        return activityRepository.getActivitiesOfOrganization(organizationId);
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Activity createActivityForOrganization(long organizationId, Activity activity) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        activity.setOrganization(organization);
        activity.setActivityPostings(new ArrayList<>());
        activityRepository.save(activity);
        organization.addActivityOfOrganization(activity);
        return activity;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Activity updateActivity(long organizationId, long activityId, Activity activity) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Activity activityToBeUpdated = activityRepository.findByIdAndOrganizationId(activityId, organizationId)
                .orElseThrow(() -> new ActivityNotFoundException(messageSource));
        activityToBeUpdated.setName(activity.getName());
        activityToBeUpdated.setLocation(activity.getLocation());
        return activityToBeUpdated;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteActivity(long organizationId, long activityId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        Activity activity = activityRepository.findByIdAndOrganizationId(activityId, organizationId)
                .orElseThrow(() -> new ActivityNotFoundException(messageSource));
        organization.getActivities().remove(activity);
        ActivityDeletedEvent activityDeletedEvent = new ActivityDeletedEvent(this, activity.getId());
        organizationPublisher.publishActivityDeletedEvent(activityDeletedEvent);
    }
}
