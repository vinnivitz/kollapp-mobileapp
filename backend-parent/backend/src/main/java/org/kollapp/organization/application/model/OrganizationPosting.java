package org.kollapp.organization.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("organization")
@NoArgsConstructor
@Getter
@Setter
public class OrganizationPosting extends Posting {

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    public OrganizationPosting(
            PostingType type,
            long amountInCents,
            String date,
            String purpose,
            Organization organization,
            long personOfOrganizationId,
            long budgetCategoryId) {
        super(type, amountInCents, date, purpose, personOfOrganizationId, budgetCategoryId);
        this.organization = organization;
    }
}
