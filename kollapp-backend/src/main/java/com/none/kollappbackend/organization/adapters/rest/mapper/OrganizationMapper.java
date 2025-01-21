package com.none.kollappbackend.organization.adapters.rest.mapper;

import com.none.kollappbackend.organization.adapters.rest.model.OrganizationTO;
import com.none.kollappbackend.organization.application.model.Organization;

import org.mapstruct.Mapper;
import org.springframework.stereotype.Service;

@Mapper(componentModel = "spring")
@Service
public interface OrganizationMapper {
    OrganizationTO organizationToOrganizationTO(Organization organization);
    Organization organizationTOToOrganization(OrganizationTO organizationTO);
}
