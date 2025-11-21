package org.kollappbackend.organization.adapters.primary.rest.mapper;

import org.kollappbackend.organization.adapters.primary.rest.dto.PersonOfOrganizationTO;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PersonOfOrganizationMapper {
    PersonOfOrganizationTO toPersonOfOrganizationTO(PersonOfOrganization personOfOrganization);
}
