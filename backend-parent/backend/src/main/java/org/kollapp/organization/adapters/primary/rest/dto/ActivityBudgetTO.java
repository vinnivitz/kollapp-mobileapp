package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ActivityBudgetTO {
    @NotNull
    private long id;

    @NotNull
    private String budgetCategoryName;

    private Long budget;

    private boolean organizationBudgetUsable;
}
