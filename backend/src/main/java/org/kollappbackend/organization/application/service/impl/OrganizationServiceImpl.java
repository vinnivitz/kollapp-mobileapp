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

import java.util.List;
import java.util.stream.Collectors;

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
        user.addRoleOrganizationManager();
        Organization persistedOrganization = organizationRepository.save(organization);
        OrganizationManager organizationManager =
                new OrganizationManager(user.getId());
        organizationManager.setOrganization(persistedOrganization);
        PersonOfOrganization persistedOrganizationManager = personOfOrganizationRepository.save(organizationManager);
        persistedOrganization.addPersonOfOrganization(persistedOrganizationManager);
        return persistedOrganization;
    }

    @Override
    public Organization updateOrganization(Organization updatedOrganization, long organizationId) {
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        if (updatedOrganization.getName() != null) {
            organization.setName(updatedOrganization.getName());
        }
        return organization;
    }

    @Override
    public Organization deleteUserFromOrganization(long personOfOrganizationId, long organizationId) {
        Organization organization = organizationRepository
                .findById(organizationId).orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personToBeDeleted = personOfOrganizationRepository.findById(personOfOrganizationId);
        organization.getPersonsOfOrganization().remove(personToBeDeleted);
        return organization;
    }

    @Override
    public void deleteUserFromAllOrganizations(long userId) {
        List<PersonOfOrganization> personsToBeDeleted = personOfOrganizationRepository.findByUserId(userId);
        for (PersonOfOrganization personOfOrganization : personsToBeDeleted) {
            personOfOrganizationRepository.deleteById(personOfOrganization.getId());
        }
    }

    @Override
    public void leaveOrganization(long organizationId) {
        KollappUser loggedInUser = kollappUserService.getLoggedInKollappUser();
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personOfOrganization = personOfOrganizationRepository
                .findByUserIdAndOrganization(loggedInUser.getId(), organization)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        if (personOfOrganization instanceof OrganizationManager orgaManager && organization.hasOnlyOneManagerLeft()
                && organization.hasManager(orgaManager)) {
            organizationRepository.deleteById(organization.getId());
        } else {
            organization.getPersonsOfOrganization().remove(personOfOrganization);
        }
    }

    @Override
    public List<Organization> getOrganizationsByLoggedInUser() {
        KollappUser loggedInKollappUser = kollappUserService.getLoggedInKollappUser();
        List<PersonOfOrganization> personsOfOrganization =
                getPersonOfOrganizationsByUserId(loggedInKollappUser.getId());
        return personsOfOrganization.stream().map(PersonOfOrganization::getOrganization).collect(Collectors.toList());
    }

    @Override
    public Organization getOrganizationById(long id) {
        return organizationRepository.findById(id).orElseThrow(() -> new OrganizationNotFoundException(messageSource));
    }

    private List<PersonOfOrganization> getPersonOfOrganizationsByUserId(long userId) {
        return personOfOrganizationRepository.findByUserId(userId);
    }


}