package org.kollapp.organization.application.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import org.kollapp.core.config.properties.ApplicationProperties;
import org.kollapp.organization.application.exception.InvalidInvitationCodeException;
import org.kollapp.organization.application.exception.LastManagerException;
import org.kollapp.organization.application.exception.MaxOrganizationsReachedException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonAlreadyHasTargetRoleException;
import org.kollapp.organization.application.exception.PersonAlreadyRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PersonOfOrganizationIsNotApprovedYetException;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationCreatedEvent;
import org.kollapp.organization.application.model.OrganizationDeletedEvent;
import org.kollapp.organization.application.model.OrganizationInvitationCode;
import org.kollapp.organization.application.model.OrganizationRole;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.model.PersonOfOrganizationStatus;
import org.kollapp.organization.application.publisher.OrganizationPublisher;
import org.kollapp.organization.application.repository.OrganizationInvitationCodeRepository;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.repository.PersonOfOrganizationRepository;
import org.kollapp.organization.application.service.OrganizationService;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.RequiresKollappOrganizationMemberRole;
import org.kollapp.user.application.model.RequiresKollappUserRole;
import org.kollapp.user.application.model.SystemRole;
import org.kollapp.user.application.service.KollappUserService;

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

    @Autowired
    private OrganizationRoleHelper organizationRoleHelper;

    @Override
    @RequiresKollappUserRole
    public Organization createOrganization(Organization organization) {
        KollappUser user = kollappUserService.getLoggedInKollappUser();
        long organizationCount = personOfOrganizationRepository.countByUserIdAndOrganizationRole(
                user.getId(), OrganizationRole.ROLE_ORGANIZATION_MANAGER);
        if (organizationCount >= applicationProperties.getMaxOrganizationsPerUser()) {
            throw new MaxOrganizationsReachedException(messageSource);
        }
        user.setRole(SystemRole.ROLE_KOLLAPP_ORGANIZATION_MEMBER);
        organization.setActivities(new ArrayList<>());
        organization.setOrganizationPostings(new ArrayList<>());
        Organization persistedOrganization = organizationRepository.save(organization);
        OrganizationInvitationCode invitationCode = persistedOrganization.generateNewInvitationCode(
                applicationProperties.getOrganizationInvitationValidityDays());
        invitationCode.setOrganization(persistedOrganization);
        PersonOfOrganization personOfOrganization = PersonOfOrganization.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .status(PersonOfOrganizationStatus.APPROVED)
                .organizationRole(OrganizationRole.ROLE_ORGANIZATION_MANAGER)
                .build();
        personOfOrganization.setOrganization(persistedOrganization);
        PersonOfOrganization persistedOrganizationManager = personOfOrganizationRepository.save(personOfOrganization);
        persistedOrganization.addPersonOfOrganization(persistedOrganizationManager);
        OrganizationCreatedEvent organizationCreatedEvent = new OrganizationCreatedEvent(this, organization.getId());
        organizationPublisher.publishOrganizationCreatedEvent(organizationCreatedEvent);
        return persistedOrganization;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization updateOrganization(Organization updatedOrganization, long organizationId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        if (updatedOrganization.getName() != null) {
            organization.setName(updatedOrganization.getName());
            organization.setPlace(updatedOrganization.getPlace());
            organization.setDescription(updatedOrganization.getDescription());
        }
        organization.initChildren();
        return organization;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization deleteUserFromOrganization(long personOfOrganizationId, long organizationId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personToBeDeleted = personOfOrganizationRepository
                .findByIdAndOrganization(personOfOrganizationId, organization)
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
        organization.getPersonsOfOrganization().remove(personToBeDeleted);
        KollappUser kollappUser = kollappUserService.findById(personToBeDeleted.getUserId());
        if (userIsNoOrganizationMember(kollappUser.getId())) {
            kollappUser.setRole(SystemRole.ROLE_KOLLAPP_USER);
        }
        organization.initChildren();
        return organization;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization generateNewOrganizationInvitationCode(long organizationId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        organization.initChildren();
        organization.generateNewInvitationCode(applicationProperties.getOrganizationInvitationValidityDays());
        return organization;
    }

    @Override
    @RequiresKollappUserRole
    public void enterOrganizationByInvitationCode(String invitationCode) {
        String currentDateMinusOneDay = LocalDate.now().minusDays(1).toString();
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        long membershipCount = personOfOrganizationRepository.countByUserId(currentUser.getId());
        if (membershipCount >= applicationProperties.getMaxOrganizationsPerUser()) {
            throw new MaxOrganizationsReachedException(messageSource);
        }
        OrganizationInvitationCode organizationInvitationCode = organizationInvitationCodeRepository
                .findByInvitationCodeAndExpirationDateIsAfter(invitationCode, currentDateMinusOneDay)
                .orElseThrow(() -> new InvalidInvitationCodeException(messageSource));
        Organization organization = organizationInvitationCode.getOrganization();
        if (organization.getPersonsOfOrganization().stream().anyMatch(p -> p.getUserId() == currentUser.getId())) {
            throw new PersonAlreadyRegisteredInOrganizationException(messageSource);
        }
        PersonOfOrganization newMember = PersonOfOrganization.builder()
                .userId(currentUser.getId())
                .username(currentUser.getUsername())
                .status(PersonOfOrganizationStatus.PENDING)
                .organizationRole(OrganizationRole.ROLE_ORGANIZATION_MEMBER)
                .build();
        newMember.setOrganization(organization);
        organization.addPersonOfOrganization(newMember);
        if (userIsNoOrganizationMember(currentUser.getId())) {
            currentUser.setRole(SystemRole.ROLE_KOLLAPP_ORGANIZATION_MEMBER);
        }
    }

    @Override
    @RequiresKollappUserRole
    public void deleteUserFromAllOrganizations(long userId) {
        List<PersonOfOrganization> personsToBeDeleted = personOfOrganizationRepository.findByUserId(userId);
        for (PersonOfOrganization personOfOrganization : personsToBeDeleted) {
            if (personOfOrganization.getOrganizationRole().equals(OrganizationRole.ROLE_ORGANIZATION_MANAGER)
                    && personOfOrganization.getOrganization().hasOnlyOneManagerLeft()) {
                throw new LastManagerException(messageSource);
            }
            personOfOrganizationRepository.deleteById(personOfOrganization.getId());
        }
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void leaveOrganization(long organizationId) {
        organizationRoleHelper.verifyOrganizationMember(organizationId);
        KollappUser loggedInUser = kollappUserService.getLoggedInKollappUser();
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personOfOrganization = personOfOrganizationRepository
                .findByUserIdAndOrganization(loggedInUser.getId(), organization)
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
        if (personOfOrganization.getOrganizationRole().equals(OrganizationRole.ROLE_ORGANIZATION_MANAGER)
                && organization.hasOnlyOneManagerLeft()) {
            deleteOrganization(loggedInUser, organization);
        } else {
            organization.getPersonsOfOrganization().remove(personOfOrganization);
        }
        if (userIsNoOrganizationMember(loggedInUser.getId())) {
            loggedInUser.setRole(SystemRole.ROLE_KOLLAPP_USER);
        }
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public void updatePersonOfOrganizationsOfUser(long userId, String username) {
        List<PersonOfOrganization> personsToBeUpdated = personOfOrganizationRepository.findByUserId(userId);
        personsToBeUpdated.forEach(person -> person.setUsername(username));
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization approveNewMemberRequest(long organizationId, long personId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personOfOrganization = personOfOrganizationRepository
                .findByIdAndOrganization(personId, organization)
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
        personOfOrganization.setStatus(PersonOfOrganizationStatus.APPROVED);
        // send email to person
        KollappUser kollappUser = kollappUserService.findById(personOfOrganization.getUserId());
        kollappUser.setRole(SystemRole.ROLE_KOLLAPP_ORGANIZATION_MEMBER);
        organization.initChildren();
        return organization;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization grantRoleToPersonOfOrganization(long organizationId, long personId, OrganizationRole role) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
                .findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personOfOrganization = personOfOrganizationRepository
                .findById(personId)
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
        if (!organization.getPersonsOfOrganization().contains(personOfOrganization)) {
            throw new PersonNotRegisteredInOrganizationException(messageSource);
        }
        if (personOfOrganization.getStatus().equals(PersonOfOrganizationStatus.PENDING)) {
            throw new PersonOfOrganizationIsNotApprovedYetException(messageSource);
        }
        if (role.equals(personOfOrganization.getOrganizationRole())) {
            throw new PersonAlreadyHasTargetRoleException(messageSource);
        }
        personOfOrganization.setOrganizationRole(role);
        return organization;
    }

    @Override
    @RequiresKollappUserRole
    public List<Organization> getOrganizationsByLoggedInUser() {
        KollappUser loggedInKollappUser = kollappUserService.getLoggedInKollappUser();
        List<PersonOfOrganization> personsOfOrganization =
                getPersonOfOrganizationsByUserId(loggedInKollappUser.getId());
        return personsOfOrganization.stream()
                .map(PersonOfOrganization::getOrganization)
                .collect(Collectors.toList());
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization getOrganizationById(long id) {
        organizationRoleHelper.verifyOrganizationMember(id);
        Organization organization =
                organizationRepository.findById(id).orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        organization.initChildren();
        return organization;
    }

    @Override
    @RequiresKollappUserRole
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

        if (userIsNoOrganizationMember(loggedInUser.getId())) {
            loggedInUser.setRole(SystemRole.ROLE_KOLLAPP_USER);
        }
    }

    private boolean userIsNoOrganizationMember(long userId) {
        List<PersonOfOrganization> rolesInOtherOrganizations = personOfOrganizationRepository.findByUserId(userId);
        return rolesInOtherOrganizations.stream().noneMatch(p -> p.getUserId() == userId);
    }
}
