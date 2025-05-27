package org.kollappbackend.organization.adapters.primary.rest.mapper;

import org.kollappbackend.organization.adapters.primary.rest.model.PersonOfOrganizationTO;
import org.kollappbackend.organization.application.model.OrganizationMember;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PersonOfOrganizationMapper {
    PersonOfOrganizationTO toPersonOfOrganizationTO(PersonOfOrganization personOfOrganization);

    @AfterMapping
    default void addRole(PersonOfOrganization personOfOrganization,
                         @MappingTarget PersonOfOrganizationTO personOfOrganizationTO) {
        String role = personOfOrganization instanceof OrganizationMember ? "MEMBER" : "MANAGER";
        personOfOrganizationTO.setRole(role);
    }
}
