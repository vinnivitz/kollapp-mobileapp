package org.kollappbackend.accounting.application.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("organization")
@NoArgsConstructor
public class OrganizationPosting extends Posting {
    public OrganizationPosting(PostingType type, long amountInCents) {
        super(type, amountInCents);
    }
}
