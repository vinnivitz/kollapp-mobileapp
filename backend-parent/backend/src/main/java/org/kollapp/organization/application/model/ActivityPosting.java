package org.kollapp.organization.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("activity")
@NoArgsConstructor
@Getter
@Setter
public class ActivityPosting extends Posting {

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    public ActivityPosting(
            PostingType type,
            long amountInCents,
            String date,
            String purpose,
            Activity activity,
            long personOfOrganizationId,
            long budgetCategoryId) {
        super(type, amountInCents, date, purpose, personOfOrganizationId, budgetCategoryId);
        this.activity = activity;
    }
}
