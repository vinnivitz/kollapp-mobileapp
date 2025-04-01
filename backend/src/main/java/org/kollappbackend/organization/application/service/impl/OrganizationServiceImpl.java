package org.kollappbackend.organization.application.service.impl;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.OrganizationManager;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.repository.PersonOfOrganizationRepository;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

@Transactional
@Slf4j
@Service
public class OrganizationServiceImpl implements OrganizationService {
    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PersonOfOrganizationRepository personOfOrganizationRepository;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private KollappUserService kollappUserService;

    @Override
    public Organization createOrganization(Organization organization) {
        KollappUser user = kollappUserService.getLoggedInKollappUser();
        Organization persistedOrganization = organizationRepository.save(organization);
        OrganizationManager organizationManager =
                new OrganizationManager(user.getName(), user.getSurname(), user.getId());
        organizationManager.setOrganization(persistedOrganization);
        PersonOfOrganization persistedOrganizationManager = personOfOrganizationRepository.save(organizationManager);
        persistedOrganization.addPersonOfOrganization(persistedOrganizationManager);
        return persistedOrganization;
    }

    @Override
    public Organization updateOrganization(Organization updatedOrganization) {
        Organization organization = getOrganizationByLoggedInUser();
        if (updatedOrganization.getName() != null && !organization.getName().equals(updatedOrganization.getName())) {
            organization.setName(updatedOrganization.getName());
        }
        return organization;
    }

    @Override
    public Organization deleteUserFromOrganization(long personOfOrganizationId) {
        Organization organization = getOrganizationByLoggedInUser();
        PersonOfOrganization personToBeDeleted = personOfOrganizationRepository.findById(personOfOrganizationId);
        organization.getPersonsOfOrganization().remove(personToBeDeleted);
        return organization;
    }

    @Override
    public void leaveOrganization() {
        Organization organization = getOrganizationByLoggedInUser();
        PersonOfOrganization personOfOrganization =
                getPersonOfOrganizationByUserId(kollappUserService.getLoggedInKollappUser().getId());
        if (personOfOrganization instanceof OrganizationManager orgaManager && organization.hasOnlyOneManagerLeft()
                && organization.hasManager(orgaManager)) {
            organizationRepository.deleteById(organization.getId());
        } else {
            organization.getPersonsOfOrganization().remove(personOfOrganization);
        }
    }

    @Override
    public Organization getOrganizationByLoggedInUser() {
        KollappUser loggedInKollappUser = kollappUserService.getLoggedInKollappUser();
        PersonOfOrganization personOfOrganization = getPersonOfOrganizationByUserId(loggedInKollappUser.getId());
        return personOfOrganization.getOrganization();
    }

    private PersonOfOrganization getPersonOfOrganizationByUserId(long userId) {
        return personOfOrganizationRepository.findByUserId(userId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
    }
}