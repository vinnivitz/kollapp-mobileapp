package com.none.kollappbackend.organization.application.service.impl;

import com.none.kollappbackend.organization.application.model.OrganizationManager;
import com.none.kollappbackend.organization.application.model.OrganizationMember;
import com.none.kollappbackend.organization.application.model.PersonOfOrganization;
import com.none.kollappbackend.organization.application.repository.PersonOfOrganizationRepository;
import com.none.kollappbackend.user.application.exception.KollappUserNotFoundException;
import com.none.kollappbackend.user.application.model.KollappUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import com.none.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.user.application.service.KollappUserService;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

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
        OrganizationManager organizationManager = new OrganizationManager(user.getName(), user.getSurname(), user.getId());
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
    public void deleteOrganizationOfLoggedInUser() {
        Organization organization = getOrganizationByLoggedInUser();
        organizationRepository.deleteById(organization.getId());
    }

    @Override
    public void deleteUserFromTheirOrganization(long userId) {
        PersonOfOrganization personOfOrganization = getPersonOfOrganizationByUserId(userId);
        Organization organization = personOfOrganization.getOrganization();
        if(!(personOfOrganization instanceof OrganizationManager organizationManager)) {
            personOfOrganizationRepository.deleteById(personOfOrganization.getId());
            return;
        }
        if(organization.hasManager(organizationManager) && organization.hasOnlyOneManagerLeft()) {
            organizationRepository.deleteById(organization.getId());
        }
    }

    @Override
    public Organization getOrganizationByLoggedInUser() {
        KollappUser loggedInkollappUser = kollappUserService.getLoggedInKollappUser();
        PersonOfOrganization personOfOrganization = getPersonOfOrganizationByUserId(loggedInkollappUser.getId());
        return personOfOrganization.getOrganization();
    }

    private PersonOfOrganization getPersonOfOrganizationByUserId(long userId) {
        return personOfOrganizationRepository.findByUserId(userId)
                .orElseThrow(() -> new KollappUserNotFoundException(messageSource));
    }
}
