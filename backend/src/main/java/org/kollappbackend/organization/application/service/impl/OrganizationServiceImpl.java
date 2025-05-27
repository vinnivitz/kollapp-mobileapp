package org.kollappbackend.organization.application.service.impl;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.core.config.properties.ApplicationProperties;
import org.kollappbackend.organization.application.exception.InvalidInvitationCodeException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollappbackend.organization.application.exception.PersonOfOrganizationIsNotApprovedYet;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.OrganizationCreatedEvent;
import org.kollappbackend.organization.application.model.OrganizationDeletedEvent;
import org.kollappbackend.organization.application.model.OrganizationInvitationCode;
import org.kollappbackend.organization.application.model.OrganizationManager;
import org.kollappbackend.organization.application.model.OrganizationMember;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.model.PersonOfOrganizationStatus;
import org.kollappbackend.organization.application.publisher.OrganizationPublisher;
import org.kollappbackend.organization.application.repository.OrganizationInvitationCodeRepository;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.repository.PersonOfOrganizationRepository;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.kollappbackend.user.application.model.ERole;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
    private OrganizationInvitationCodeRepository organizationInvitationCodeRepository;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private OrganizationPublisher organizationPublisher;

    @Autowired
    private ApplicationProperties applicationProperties;

    @Override
    public Organization createOrganization(Organization organization) {
        KollappUser user = kollappUserService.getLoggedInKollappUser();
        user.addRoleOrganizationManager();
        Organization persistedOrganization = organizationRepository.save(organization);
        OrganizationInvitationCode invitationCode =
                persistedOrganization.generateNewInvitationCode(applicationProperties.getOrganizationInvitationValidityDays());
        invitationCode.setOrganization(persistedOrganization);
        OrganizationManager organizationManager =
                new OrganizationManager(user.getId(), user.getUsername(), PersonOfOrganizationStatus.APPROVED);
        organizationManager.setOrganization(persistedOrganization);
        PersonOfOrganization persistedOrganizationManager = personOfOrganizationRepository.save(organizationManager);
        persistedOrganization.addPersonOfOrganization(persistedOrganizationManager);
        OrganizationCreatedEvent organizationCreatedEvent = new OrganizationCreatedEvent(this, organization.getId());
        organizationPublisher.publishOrganizationCreatedEvent(organizationCreatedEvent);
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
    public Organization generateNewOrganizationInvitationCode(long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        organization.generateNewInvitationCode(applicationProperties.getOrganizationInvitationValidityDays());
        return organization;
    }

    @Override
    public Organization enterOrganizationByInvitationCode(String invitationCode) {
        String currentDatePlusOneDay = LocalDate.now().minusDays(1).toString();
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        OrganizationInvitationCode organizationInvitationCode = organizationInvitationCodeRepository
                .findByInvitationCodeAndExpirationDateIsAfter(invitationCode, currentDatePlusOneDay)
                .orElseThrow(() -> new InvalidInvitationCodeException(messageSource));
        Organization organization = organizationInvitationCode.getOrganization();
        OrganizationMember newMember = new OrganizationMember(
                currentUser.getId(),
                currentUser.getUsername(),
                PersonOfOrganizationStatus.PENDING);
        newMember.setOrganization(organization);
        organization.addPersonOfOrganization(newMember);
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
            deleteOrganization(loggedInUser, organization);
        } else {
            organization.getPersonsOfOrganization().remove(personOfOrganization);
        }
    }

    @Override
    public void updatePersonOfOrganizationsOfUser(long userId, String username) {
        List<PersonOfOrganization> personsToBeUpdated = personOfOrganizationRepository.findByUserId(userId);
        personsToBeUpdated.forEach(person -> person.setUsername(username));
    }

    @Override
    public Organization grantRoleToPersonOfOrganization(long organizationId, long personId, String role) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personOfOrganization = personOfOrganizationRepository.findById(personId);
        if (!organization.getPersonsOfOrganization().contains(personOfOrganization)) {
            throw new PersonNotRegisteredInOrganizationException(messageSource);
        }
        if (personOfOrganization.getStatus().equals(PersonOfOrganizationStatus.PENDING)) {
            throw new PersonOfOrganizationIsNotApprovedYet(messageSource);
        }
        if (role.equals("MANAGER")) {
            if (personOfOrganization instanceof OrganizationManager) {
                return organization;
            } else {
                OrganizationManager organizationManager = new OrganizationManager(personOfOrganization.getUserId(),
                        personOfOrganization.getUsername(), personOfOrganization.getStatus());
                organization.exchangePersonOfOrganization(personOfOrganization, organizationManager);
            }
        }
        if (role.equals("MEMBER")) {
            if (personOfOrganization instanceof OrganizationMember) {
                return organization;
            } else {
                OrganizationMember organizationMember = new OrganizationMember(personOfOrganization.getUserId(),
                        personOfOrganization.getUsername(), personOfOrganization.getStatus());
                organization.exchangePersonOfOrganization(personOfOrganization, organizationMember);
            }
        }
        return organization;
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

    @Override
    public Organization getOrganizationByInvitationCode(String invitationCode) {
        String localDateMinusOneDay = LocalDate.now().minusDays(1).toString();
        OrganizationInvitationCode invCode = organizationInvitationCodeRepository
                .findByInvitationCodeAndExpirationDateIsAfter(invitationCode, localDateMinusOneDay)
                .orElseThrow(() -> new InvalidInvitationCodeException(messageSource));
        return invCode.getOrganization();
    }

    private List<PersonOfOrganization> getPersonOfOrganizationsByUserId(long userId) {
        return personOfOrganizationRepository.findByUserId(userId);
    }

    private void deleteOrganization(KollappUser loggedInUser, Organization organization) {
        organizationRepository.deleteById(organization.getId());
        OrganizationDeletedEvent organizationDeletedEvent = new OrganizationDeletedEvent(this, organization.getId());
        organizationPublisher.publishOrganizationDeletedEvent(organizationDeletedEvent);
        List<PersonOfOrganization> rolesInOtherOrganizations = personOfOrganizationRepository
                .findByUserId(loggedInUser.getId());
        boolean isStillManager = rolesInOtherOrganizations.stream()
                .anyMatch(p -> p instanceof OrganizationManager);
        if (!isStillManager) {
            loggedInUser.getRoles().remove(ERole.ROLE_ORGANIZATION_MANAGER);
        }
    }
}