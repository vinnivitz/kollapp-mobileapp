package com.none.kollappbackend.organization.adapters.primary.rest.mapper;

import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationCreationRequestTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.OrganizationUpdateRequestTO;
import com.none.kollappbackend.organization.application.model.Organization;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    Organization organizationCreationRequestToOrganization(OrganizationCreationRequestTO organizationCreationRequestTO);

    Organization organizationUpdateRequestToOrganization(OrganizationUpdateRequestTO organizationUpdateRequestTO);

    OrganizationTO organizationToOrganizationTO(Organization organization);
}
