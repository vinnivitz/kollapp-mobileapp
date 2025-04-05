package org.kollappbackend.accounting.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("activity")
@NoArgsConstructor
public class ActivityPosting extends Posting {
    private long activityId;
    public ActivityPosting(PostingType type, long amountInCents, long activityId) {
        super(type, amountInCents);
        this.activityId = activityId;
    }
}
