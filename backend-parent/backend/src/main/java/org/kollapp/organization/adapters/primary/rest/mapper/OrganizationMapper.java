package org.kollapp.organization.adapters.primary.rest.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import org.kollapp.organization.adapters.primary.rest.dto.OrganizationCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationMinifiedTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationTO;
import org.kollapp.organization.adapters.primary.rest.dto.OrganizationUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.enums.OrganizationMembershipState;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.model.PersonOfOrganizationStatus;

@Mapper(
        componentModel = "spring",
        uses = {PersonOfOrganizationMapper.class, ActivityMapper.class, PostingMapper.class})
public interface OrganizationMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "organizationInvitationCode", ignore = true)
    @Mapping(target = "organizationPostings", ignore = true)
    Organization organizationCreationRequestToOrganization(OrganizationCreationRequestTO organizationCreationRequestTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "personsOfOrganization", ignore = true)
    @Mapping(target = "activities", ignore = true)
    @Mapping(target = "organizationInvitationCode", ignore = true)
    @Mapping(target = "organizationPostings", ignore = true)
    Organization organizationUpdateRequestToOrganization(OrganizationUpdateRequestTO organizationUpdateRequestTO);

    OrganizationTO organizationToOrganizationTO(Organization organization);

    @Mapping(target = "state", ignore = true)
    OrganizationMinifiedTO organizationToOrganizationMinifiedTO(Organization organization);

    default OrganizationMinifiedTO organizationToOrganizationMinifiedTO(Organization organization, long userId) {
        OrganizationMinifiedTO organizationMinifiedTO = organizationToOrganizationMinifiedTO(organization);
        OrganizationMembershipState state = determineUserMembershipState(organization, userId);
        organizationMinifiedTO.setState(state);
        return organizationMinifiedTO;
    }

    default OrganizationMembershipState determineUserMembershipState(Organization organization, long userId) {
        if (organization.getPersonsOfOrganization() == null) {
            return OrganizationMembershipState.NOT_MEMBER;
        }

        return organization.getPersonsOfOrganization().stream()
                .filter(personOfOrganization -> personOfOrganization.getUserId() == userId)
                .findFirst()
                .map(PersonOfOrganization::getStatus)
                .map(status -> {
                    if (status == PersonOfOrganizationStatus.APPROVED) {
                        return OrganizationMembershipState.APPROVED;
                    } else if (status == PersonOfOrganizationStatus.PENDING) {
                        return OrganizationMembershipState.PENDING;
                    }
                    return OrganizationMembershipState.NOT_MEMBER;
                })
                .orElse(OrganizationMembershipState.NOT_MEMBER);
    }
}
