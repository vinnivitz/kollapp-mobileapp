package org.kollappbackend.accounting.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("activity")
@NoArgsConstructor
@Getter
@Setter
public class ActivityPosting extends Posting {
    private long activityId;

    public ActivityPosting(PostingType type, long amountInCents, long activityId) {
        super(type, amountInCents);
        this.activityId = activityId;
    }
}
