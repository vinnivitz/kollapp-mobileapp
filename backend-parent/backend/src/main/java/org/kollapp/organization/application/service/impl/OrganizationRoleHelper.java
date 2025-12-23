package org.kollapp.organization.application.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.kollapp.organization.application.exception.OrganizationAuthorizationException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PersonOfOrganizationIsNotApprovedYetException;
import org.kollapp.organization.application.exception.SelfActionNotAllowedException;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationRole;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.model.PersonOfOrganizationStatus;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.service.KollappUserService;

@Service
class OrganizationRoleHelper {

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private OrganizationRepository organizationRepository;

    protected void verifyOrganizationMember(Long organizationId) {
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        Organization organization = getOrganization(organizationId);
        if (!isMemberOfOrganization(currentUser, organization)) {
            throw new OrganizationAuthorizationException();
        }
    }

    protected void verifyOrganizationManager(Long organizationId) {
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        Organization organization = getOrganization(organizationId);
        if (!isManagerOfOrganization(currentUser, organization)) {
            throw new OrganizationAuthorizationException();
        }
    }

    protected void verifySelfActionNotAllowed(long targetUserId) {
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        if (currentUser.getId() == targetUserId) {
            throw new SelfActionNotAllowedException();
        }
    }

    private Organization getOrganization(Long organizationId) {
        Optional<Organization> organizationOpt = organizationRepository.findById(organizationId);
        if (organizationOpt.isEmpty()) {
            throw new OrganizationNotFoundException();
        }
        return organizationOpt.get();
    }

    private boolean isMemberOfOrganization(KollappUser currentUser, Organization organization) {
        PersonOfOrganization personOfOrganization = getPersonOfOrganization(currentUser, organization);
        if (personOfOrganization.getStatus().equals(PersonOfOrganizationStatus.PENDING)) {
            throw new PersonOfOrganizationIsNotApprovedYetException();
        }
        return personOfOrganization.getOrganizationRole().equals(OrganizationRole.ROLE_ORGANIZATION_MEMBER)
                || isManagerOfOrganization(currentUser, organization);
    }

    private boolean isManagerOfOrganization(KollappUser currentUser, Organization organization) {
        PersonOfOrganization personOfOrganization = getPersonOfOrganization(currentUser, organization);
        return personOfOrganization.getOrganizationRole().equals(OrganizationRole.ROLE_ORGANIZATION_MANAGER);
    }

    private PersonOfOrganization getPersonOfOrganization(KollappUser currentUser, Organization organization) {
        return organization.getPersonsOfOrganization().stream()
                .filter(p -> p.getUserId() == currentUser.getId())
                .findFirst()
                .orElseThrow(PersonNotRegisteredInOrganizationException::new);
    }
}
