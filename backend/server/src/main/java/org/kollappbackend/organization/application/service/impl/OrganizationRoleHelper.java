package org.kollappbackend.organization.application.service.impl;

import java.util.Optional;
import org.kollappbackend.organization.application.exception.OrganizationAuthorizationException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollappbackend.organization.application.exception.PersonOfOrganizationIsNotApprovedYetException;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.OrganizationRole;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.model.PersonOfOrganizationStatus;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

@Service
class OrganizationRoleHelper {

    @Autowired private KollappUserService kollappUserService;

    @Autowired private OrganizationRepository organizationRepository;

    @Autowired private MessageSource messageSource;

    protected void verifyOrganizationMember(Long organizationId) {
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        Organization organization = getOrganization(organizationId);
        if (!isMemberOfOrganization(currentUser, organization)) {
            throw new OrganizationAuthorizationException(messageSource);
        }
    }

    protected void verifyOrganizationManager(Long organizationId) {
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        Organization organization = getOrganization(organizationId);
        if (!isManagerOfOrganization(currentUser, organization)) {
            throw new OrganizationAuthorizationException(messageSource);
        }
    }

    private Organization getOrganization(Long organizationId) {
        Optional<Organization> organizationOpt = organizationRepository.findById(organizationId);
        if (organizationOpt.isEmpty()) {
            throw new OrganizationNotFoundException(messageSource);
        }
        return organizationOpt.get();
    }

    private boolean isMemberOfOrganization(KollappUser currentUser, Organization organization) {
        PersonOfOrganization personOfOrganization =
                getPersonOfOrganization(currentUser, organization);
        if (personOfOrganization.getStatus().equals(PersonOfOrganizationStatus.PENDING)) {
            throw new PersonOfOrganizationIsNotApprovedYetException(messageSource);
        }
        return personOfOrganization
                        .getOrganizationRole()
                        .equals(OrganizationRole.ROLE_ORGANIZATION_MEMBER)
                || isManagerOfOrganization(currentUser, organization);
    }

    private boolean isManagerOfOrganization(KollappUser currentUser, Organization organization) {
        PersonOfOrganization personOfOrganization =
                getPersonOfOrganization(currentUser, organization);
        return personOfOrganization
                .getOrganizationRole()
                .equals(OrganizationRole.ROLE_ORGANIZATION_MANAGER);
    }

    private PersonOfOrganization getPersonOfOrganization(
            KollappUser currentUser, Organization organization) {
        return organization.getPersonsOfOrganization().stream()
                .filter(p -> p.getUserId() == currentUser.getId())
                .findFirst()
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
    }
}
