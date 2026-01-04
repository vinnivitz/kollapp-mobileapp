package org.kollapp.organization.adapters.primary.rest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

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
public class OrganizationBudgetCategoryRequestTO {
    @NotBlank(message = "{validation.organization.budget-category.name.required}")
    @Size(max = 50, message = "{validation.organization.budget-category.name.maxlength}")
    private String name;

    @NotBlank(message = "{validation.organization.budget-category.default.required}")
    private boolean defaultCategory;
}
