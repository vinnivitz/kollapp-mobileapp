package org.kollappbackend.accounting.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("activity")
@NoArgsConstructor
public class ActivityPosting extends Posting {
    public ActivityPosting(PostingType type, long amountInCents) {
        super(type, amountInCents);
    }
}
