package org.kollapp.organization.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.kollapp.organization.adapters.primary.rest.dto.OrganizationBudgetCategoryRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationBudgetCategoryResponseTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationMinifiedTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationUpdateRequestTO;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationBudgetCategory;

@Mapper(
        componentModel = "spring",
        uses = {PersonOfOrganizationMapper.class, ActivityMapper.class, PostingMapper.class})
public interface OrganizationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "organizationInvitationCode", ignore = true)
    @Mapping(target = "organizationPostings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "budgetCategories", ignore = true)
    Organization organizationCreationRequestToOrganization(OrganizationCreationRequestTO organizationCreationRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "organizationInvitationCode", ignore = true)
    @Mapping(target = "organizationPostings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "budgetCategories", ignore = true)
    Organization organizationUpdateRequestToOrganization(OrganizationUpdateRequestTO organizationUpdateRequestTO);

    OrganizationTO organizationToOrganizationTO(Organization organization);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organization", ignore = true)
    OrganizationBudgetCategory organizationBudgetCategoryTOToOrganizationBudgetCategory(
            OrganizationBudgetCategoryRequestTO organizationBudgetCategoryTO);

    OrganizationBudgetCategoryResponseTO organizationBudgetCategoryToOrganizationBudgetCategoryResponseTO(
            OrganizationBudgetCategory organizationBudgetCategory);

    OrganizationMinifiedTO organizationToOrganizationMinifiedTO(Organization organization);
}
