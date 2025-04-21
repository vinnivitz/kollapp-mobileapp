package org.kollappbackend.accounting.application.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BudgetAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private long organizationId;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "budgetAccount", orphanRemoval = true)
    private List<Posting> postings;

    public void addPosting(Posting posting) {
        if (postings == null) {
            postings = new ArrayList<>();
        }
        postings.add(posting);
    }

    public boolean containsPosting(Posting posting) {
        return postings != null && postings.contains(posting);
    }
}
