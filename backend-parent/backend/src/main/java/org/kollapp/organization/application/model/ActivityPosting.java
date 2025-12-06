package org.kollapp.organization.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@DiscriminatorValue("activity")
@NoArgsConstructor
@Getter
@Setter
@ToString(exclude = "activity")
public class ActivityPosting extends Posting {

    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    public ActivityPosting(PostingType type, long amountInCents, String date, String purpose, Activity activity) {
        super(type, amountInCents, date, purpose);
        this.activity = activity;
    }
}
