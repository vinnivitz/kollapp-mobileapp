package org.kollappbackend.accounting.adapters.secondary.db.jpa;

import org.kollappbackend.accounting.application.model.ActivityPosting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityPostingJpaRepository extends JpaRepository<ActivityPosting, Long> {
    void deleteByActivityId(long activityId);
}
