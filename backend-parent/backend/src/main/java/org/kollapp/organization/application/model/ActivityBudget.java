package org.kollapp.organization.application.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long budgetCategoryId;

    @ManyToOne
    @JoinColumn(name = "activityId")
    private Activity activity;

    private long budget;

    private boolean limitSet;

    @Transient
    private long currentlyUsedBudget;

    protected void calculateCurrentlyUsedBudget() {
        this.currentlyUsedBudget = activity.getActivityPostings()
            .stream()
            .filter(p -> p.getOrganizationBudgetCategoryId() == this.budgetCategoryId)
            .mapToLong(Posting::getAmountInCents)
            .sum();
    }
}
