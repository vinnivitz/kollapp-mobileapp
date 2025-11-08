package org.kollappbackend.organization.application.service.impl;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.core.config.properties.ApplicationProperties;
import org.kollappbackend.organization.application.exception.InvalidInvitationCodeException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PersonAlreadyHasTargetRoleException;
import org.kollappbackend.organization.application.exception.PersonAlreadyRegisteredInOrganizationException;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollappbackend.organization.application.exception.PersonOfOrganizationIsNotApprovedYetException;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.OrganizationCreatedEvent;
import org.kollappbackend.organization.application.model.OrganizationDeletedEvent;
import org.kollappbackend.organization.application.model.OrganizationInvitationCode;
import org.kollappbackend.organization.application.model.OrganizationRole;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.model.PersonOfOrganizationStatus;
import org.kollappbackend.organization.application.publisher.OrganizationPublisher;
import org.kollappbackend.organization.application.repository.OrganizationInvitationCodeRepository;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.repository.PersonOfOrganizationRepository;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.model.RequiresKollappOrganizationMemberRole;
import org.kollappbackend.user.application.model.RequiresKollappUserRole;
import org.kollappbackend.user.application.model.SystemRole;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
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

    @Autowired
    private OrganizationRoleHelper organizationRoleHelper;

    @Override
    @RequiresKollappUserRole
    public Organization createOrganization(Organization organization) {
        KollappUser user = kollappUserService.getLoggedInKollappUser();
        user.setRole(SystemRole.ROLE_KOLLAPP_ORGANIZATION_MEMBER);
        organization.setOrganizationPostings(new ArrayList<>());
        Organization persistedOrganization = organizationRepository.save(organization);
        OrganizationInvitationCode invitationCode =
                persistedOrganization.generateNewInvitationCode(applicationProperties.getOrganizationInvitationValidityDays());
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
        return organization;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization deleteUserFromOrganization(long personOfOrganizationId, long organizationId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository
                .findById(organizationId).orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personToBeDeleted = personOfOrganizationRepository
                .findByIdAndOrganization(personOfOrganizationId, organization)
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
        organization.getPersonsOfOrganization().remove(personToBeDeleted);
        KollappUser kollappUser = kollappUserService.findById(personToBeDeleted.getUserId());
        if (userIsNoOrganizationMember(kollappUser.getId())) {
            kollappUser.setRole(SystemRole.ROLE_KOLLAPP_USER);
        }
        return organization;
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization generateNewOrganizationInvitationCode(long organizationId) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        organization.initChildren();
        organization.generateNewInvitationCode(applicationProperties.getOrganizationInvitationValidityDays());
        return organization;
    }

    @Override
    @RequiresKollappUserRole
    public Organization enterOrganizationByInvitationCode(String invitationCode) {
        String currentDatePlusOneDay = LocalDate.now().minusDays(1).toString();
        KollappUser currentUser = kollappUserService.getLoggedInKollappUser();
        OrganizationInvitationCode organizationInvitationCode = organizationInvitationCodeRepository
                .findByInvitationCodeAndExpirationDateIsAfter(invitationCode, currentDatePlusOneDay)
                .orElseThrow(() -> new InvalidInvitationCodeException(messageSource));
        Organization organization = organizationInvitationCode.getOrganization();
        if (organization.getPersonsOfOrganization().stream()
                .anyMatch(p -> p.getUserId() == currentUser.getId())) {
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
        return organization;
    }

    @Override
    @RequiresKollappUserRole
    public void deleteUserFromAllOrganizations(long userId) {
        List<PersonOfOrganization> personsToBeDeleted = personOfOrganizationRepository.findByUserId(userId);
        for (PersonOfOrganization personOfOrganization : personsToBeDeleted) {
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
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
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
    public Organization grantRoleToPersonOfOrganization(long organizationId, long personId, String role) {
        organizationRoleHelper.verifyOrganizationManager(organizationId);
        OrganizationRole targetRole = OrganizationRole.valueOf(role);
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        PersonOfOrganization personOfOrganization = personOfOrganizationRepository.findById(personId)
                .orElseThrow(() -> new PersonNotRegisteredInOrganizationException(messageSource));
        if (!organization.getPersonsOfOrganization().contains(personOfOrganization)) {
            throw new PersonNotRegisteredInOrganizationException(messageSource);
        }
        if (personOfOrganization.getStatus().equals(PersonOfOrganizationStatus.PENDING)) {
            throw new PersonOfOrganizationIsNotApprovedYetException(messageSource);
        }
        if (targetRole.equals(personOfOrganization.getOrganizationRole())) {
            throw new PersonAlreadyHasTargetRoleException(messageSource);
        }
        personOfOrganization.setOrganizationRole(targetRole);
        return organization;
    }

    @Override
    @RequiresKollappUserRole
    public List<Organization> getOrganizationsByLoggedInUser() {
        KollappUser loggedInKollappUser = kollappUserService.getLoggedInKollappUser();
        List<PersonOfOrganization> personsOfOrganization =
                getPersonOfOrganizationsByUserId(loggedInKollappUser.getId());
        return personsOfOrganization.stream().map(PersonOfOrganization::getOrganization).collect(Collectors.toList());
    }

    @Override
    @RequiresKollappOrganizationMemberRole
    public Organization getOrganizationById(long id) {
        organizationRoleHelper.verifyOrganizationMember(id);
        Organization organization = organizationRepository
                .findById(id)
                .orElseThrow(() -> new OrganizationNotFoundException(messageSource));
        organization.initChildren();
        return organizationRepository.findById(id).orElseThrow(() -> new OrganizationNotFoundException(messageSource));
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
        List<PersonOfOrganization> rolesInOtherOrganizations = personOfOrganizationRepository
                .findByUserId(userId);
        return rolesInOtherOrganizations.stream().noneMatch(p -> p.getUserId() == userId);
    }
}