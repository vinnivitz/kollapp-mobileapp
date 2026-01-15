package org.kollapp.organization.adapters.primary.rest.dto;

import java.util.List;

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
public class OrganizationTO {
    @NotNull
    private long id;

    @NotNull
    private String name;

    @NotNull
    private String place;

    private String description;

    @NotNull
    private OrganizationInvitationCodeTO organizationInvitationCode;

    @NotNull
    private List<PersonOfOrganizationTO> personsOfOrganization;

    @NotNull
    private List<OrganizationBudgetCategoryResponseTO> budgetCategories;

    @NotNull
    private List<ActivityTO> activities;

    @NotNull
    private List<PostingTO> organizationPostings;
}
