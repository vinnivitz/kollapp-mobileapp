package org.kollappbackend.organization.adapters.primary.rest.mapper;

import org.kollappbackend.organization.adapters.primary.rest.dto.OrganizationBaseTO;
import org.kollappbackend.organization.adapters.primary.rest.dto.OrganizationCreationRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.dto.OrganizationMinifiedTO;
import org.kollappbackend.organization.adapters.primary.rest.dto.OrganizationTO;
import org.kollappbackend.organization.adapters.primary.rest.dto.OrganizationUpdateRequestTO;
import org.kollappbackend.organization.application.model.Organization;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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
