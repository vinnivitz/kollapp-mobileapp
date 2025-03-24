package com.none.kollappbackend.organization.adapters.secondary.db;

import com.none.kollappbackend.organization.adapters.secondary.db.jpa.ActivityJpaRepository;
import com.none.kollappbackend.organization.application.model.Activity;
import com.none.kollappbackend.organization.application.repository.ActivityRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@AllArgsConstructor
public class ActivityRepositoryImpl implements ActivityRepository {

    private ActivityJpaRepository activityJpaRepository;

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
}
