package org.kollapp.organization.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;

import org.kollapp.organization.adapters.primary.rest.dto.PersonOfOrganizationTO;
import org.kollapp.organization.application.model.PersonOfOrganization;

@Mapper(componentModel = "spring")
public interface PersonOfOrganizationMapper {
    PersonOfOrganizationTO toPersonOfOrganizationTO(PersonOfOrganization personOfOrganization);
}
