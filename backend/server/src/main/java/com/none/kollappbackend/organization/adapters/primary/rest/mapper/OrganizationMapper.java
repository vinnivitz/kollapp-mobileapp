package com.none.kollappbackend.organization.adapters.primary.rest.mapper;

import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationCreationRequestTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationUpdateRequestTO;
import com.none.kollappbackend.organization.application.model.Organization;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    Organization organizationCreationRequestToOrganization(OrganizationCreationRequestTO organizationCreationRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    Organization organizationUpdateRequestToOrganization(OrganizationUpdateRequestTO organizationUpdateRequestTO);

    OrganizationTO organizationToOrganizationTO(Organization organization);
}
