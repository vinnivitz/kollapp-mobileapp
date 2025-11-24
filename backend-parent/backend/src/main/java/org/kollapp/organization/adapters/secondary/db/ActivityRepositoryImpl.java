package org.kollapp.organization.adapters.secondary.db;

import java.util.List;
import java.util.Optional;

import lombok.AllArgsConstructor;

import org.springframework.stereotype.Repository;

import org.kollapp.organization.adapters.secondary.db.jpa.ActivityJpaRepository;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.repository.ActivityRepository;

@Repository
@AllArgsConstructor
public class ActivityRepositoryImpl implements ActivityRepository {

    private final ActivityJpaRepository activityJpaRepository;

    @Override
    public List<Activity> getActivitiesOfOrganization(long organizationId) {
        return activityJpaRepository.findByOrganizationId(organizationId);
    }

    @Override
    public Optional<Activity> findById(long activityId) {
        return activityJpaRepository.findById(activityId);
    }

    @Override
    public Activity save(Activity activity) {
        return activityJpaRepository.save(activity);
    }

    @Override
    public Optional<Activity> findByIdAndOrganizationId(long id, long organizationId) {
        return activityJpaRepository.findByIdAndOrganizationId(id, organizationId);
    }
}
