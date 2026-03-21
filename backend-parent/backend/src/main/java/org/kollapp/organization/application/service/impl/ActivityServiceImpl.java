package org.kollapp.organization.application.service.impl;

import java.util.ArrayList;
import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.ActivityBudget;
import org.kollapp.organization.application.model.ActivityDeletedEvent;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationBudgetCategory;
import org.kollapp.organization.application.publisher.OrganizationPublisher;
import org.kollapp.organization.application.repository.ActivityRepository;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.ActivityService;
import org.kollapp.user.application.model.RequiresKollappOrganizationMemberRole;

@Service
@Transactional
public class ActivityServiceImpl implements ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

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
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        activity.setOrganization(organization);
        activity.setActivityPostings(new ArrayList<>());
        Activity persistedActivity = activityRepository.save(activity);
        List<ActivityBudget> budgets = defaultBudgetMapping(organization, persistedActivity);
        activity.setActivityCategoryBudgets(budgets);
        organization.addActivityOfOrganization(activity);
        return activity;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Activity updateActivity(long organizationId, long activityId, Activity activity) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Activity activityToBeUpdated = activityRepository
            .findByIdAndOrganizationId(activityId, organizationId)
            .orElseThrow(ActivityNotFoundException::new);
        activityToBeUpdated.setName(activity.getName());
        activityToBeUpdated.setLocation(activity.getLocation());
        activityToBeUpdated.setDate(activity.getDate());
        return activityToBeUpdated;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void deleteActivity(long organizationId, long activityId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization =
            organizationRepository.findById(organizationId).orElseThrow(OrganizationNotFoundException::new);
        Activity activity = activityRepository
            .findByIdAndOrganizationId(activityId, organizationId)
            .orElseThrow(ActivityNotFoundException::new);
        organization.getActivities().remove(activity);
        ActivityDeletedEvent activityDeletedEvent = new ActivityDeletedEvent(this, activity.getId());
        organizationPublisher.publishActivityDeletedEvent(activityDeletedEvent);
    }

    private List<ActivityBudget> defaultBudgetMapping(Organization organization, Activity persistedActivity) {
        OrganizationBudgetCategory defaultBudgetCategory = organization.findDefaultBudgetCategory();
        List<ActivityBudget> budgets = new ArrayList<>();
        ActivityBudget defaultActivityBudget = ActivityBudget.builder()
            .budgetCategoryId(defaultBudgetCategory.getId())
            .activity(persistedActivity)
            .budget(0L)
            .limitSet(true)
            .build();
        budgets.add(defaultActivityBudget);
        return budgets;
    }
}
