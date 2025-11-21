package org.kollapp.organization.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.kollapp.organization.adapters.primary.rest.dto.OrganizationBaseTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationMinifiedTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationUpdateRequestTO;
import org.kollapp.organization.application.model.Organization;

@Mapper(
        componentModel = "spring",
        uses = {PersonOfOrganizationMapper.class, ActivityMapper.class, PostingMapper.class})
public interface OrganizationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "organizationInvitationCode", ignore = true)
    @Mapping(target = "organizationPostings", ignore = true)
    Organization organizationCreationRequestToOrganization(
            OrganizationCreationRequestTO organizationCreationRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "organizationInvitationCode", ignore = true)
    @Mapping(target = "organizationPostings", ignore = true)
    Organization organizationUpdateRequestToOrganization(
            OrganizationUpdateRequestTO organizationUpdateRequestTO);

    OrganizationTO organizationToOrganizationTO(Organization organization);

    OrganizationBaseTO organizationToOrganizationBaseTO(Organization organization);

    OrganizationMinifiedTO organizationToOrganizationMinifiedTO(Organization organization);
}
