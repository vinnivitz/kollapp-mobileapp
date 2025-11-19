package org.kollappbackend.core.organization;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.exception.*;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.OrganizationRole;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.model.PersonOfOrganizationStatus;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.model.SystemRole;
import org.kollappbackend.user.application.repository.KollappUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

@Sql(scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql",
        executionPhase = AFTER_TEST_METHOD)
@WithMockUser(username = "nina", authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
public class OrganizationServiceManagerIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;
    @Autowired
    private KollappUserRepository kollappUserRepository;
    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    public void createOrganizationShouldCreateOrganization() {
        LocalDate now = LocalDate.now();
        Organization organizationDummy = Organization.builder()
                .place("Testort")
                .name("Testorga")
                .description("Testbeschreibung")
                .build();
        Organization organization = organizationService
                .createOrganization(organizationDummy);
        assertThat(organization.getId()).isNotZero();
        assertThat(organization.getName()).isEqualTo("Testorga");
        assertThat(organization.getDescription()).isEqualTo("Testbeschreibung");
        assertThat(organization.getPlace()).isEqualTo("Testort");
        assertThat(organization.getOrganizationInvitationCode().getExpirationDate())
                .isEqualTo(now.plusDays(3).toString());
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
        assertThat(organization.getPersonsOfOrganization().getFirst().getUsername()).isEqualTo("nina");
        assertThat(organization.getOrganizationInvitationCode()).isNotNull();
    }

    @Test
    public void updateOrganizationShouldReturnUpdatedOrganization() {
        Organization organizationDummy = Organization.builder()
                .place("Testort_updated")
                .name("Testorga_updated")
                .description("Testbeschreibung_updated")
                .build();
        Organization organization = organizationService.updateOrganization(organizationDummy, 1);
        assertThat(organization.getId()).isEqualTo(1);
        assertThat(organization.getName()).isEqualTo("Testorga_updated");
        assertThat(organization.getDescription()).isEqualTo("Testbeschreibung_updated");
        assertThat(organization.getPlace()).isEqualTo("Testort_updated");
    }

    @Test
    public void updateOrganizationWithWrongIdShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.updateOrganization(new Organization(), -1));
    }

    @Test
    public void deleteUserFromOrganizationShouldDeleteThem() {
        Organization organization = organizationService.deleteUserFromOrganization(3, 1);
        assertThat(organization.getPersonsOfOrganization().stream().mapToLong(PersonOfOrganization::getId))
                .doesNotContain(3L);
        KollappUser kollappUser = kollappUserRepository.findById(3L).orElse(new KollappUser());
        assertThat(kollappUser.getRole()).isEqualTo(SystemRole.ROLE_KOLLAPP_USER);
    }

    @Test
    public void deleteWrongUserFromWrongOrganizationShouldThrowException() {
        // existing user in existing organization, but no manager rights
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(4, 2));

        // not existing user in existing organization with manager rights
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(5, 1));

        // not existing organization but existing user
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(2, 4));
    }

    @Test
    public void generateNewOrganizationInvitationCodeShouldReturnNewCode() {
        LocalDate now = LocalDate.now();
        String currentInvitationCode = organizationService.getOrganizationById(1)
                .getOrganizationInvitationCode()
                .getCode();
        Organization organization = organizationService.generateNewOrganizationInvitationCode(1);
        assertThat(organization.getOrganizationInvitationCode().getCode()).isNotNull();
        assertThat(organization.getOrganizationInvitationCode().getCode()).isNotEqualTo(currentInvitationCode);
        assertThat(organization.getOrganizationInvitationCode().getExpirationDate())
                .isEqualTo(now.plusDays(3).toString());
    }

    @Test
    public void generateNewOrganizationInvitationCodeForWrongOrganizationShouldThrowException() {
        // existing organization, no manager rights
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.generateNewOrganizationInvitationCode(2));

        // not existing organization
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.generateNewOrganizationInvitationCode(4));
    }

    @Test
    @Transactional
    public void enterOrganizationByInvitationCodeShouldReturnEnteredOrganization() {
        Organization organization = organizationService.enterOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(2);
        assertThat(organization.getName()).isEqualTo("Frequenzfamilie");
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(2);
        Optional<PersonOfOrganization> personOfOrganizationOpt = organization.getPersonsOfOrganization().stream()
                .filter(p -> p.getUsername().equals("nina"))
                .findFirst();
        assertThat(personOfOrganizationOpt).isPresent();
        PersonOfOrganization personOfOrganization = personOfOrganizationOpt.get();
        assertThat(personOfOrganization.getUsername()).isEqualTo("nina");
        assertThat(personOfOrganization.getOrganizationRole()).isEqualTo(OrganizationRole.ROLE_ORGANIZATION_MEMBER);
        assertThat(personOfOrganization.getStatus()).isEqualTo(PersonOfOrganizationStatus.PENDING);
    }

    @Test
    public void enterOrganizationWithWrongInvitationCodeShouldThrowException() {
        assertThatExceptionOfType(InvalidInvitationCodeException.class).isThrownBy(
                () -> organizationService.enterOrganizationByInvitationCode("asdfjkl")
        );
    }

    @Test
    public void enterOrganizationWithInvitationCodeTwiceShouldThrowException() {
        assertThatExceptionOfType(PersonAlreadyRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.enterOrganizationByInvitationCode("asdfjkloe"));
    }

    @Test
    @Transactional
    public void leaveOrganizationShouldRemoveUserFromOrganization() {
        organizationService.leaveOrganization(1);
        Organization organization = organizationRepository.findById(1).orElseThrow();
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(2);
        List<String> remainingUsernamesInOrganization = organization.getPersonsOfOrganization()
                .stream()
                .map(PersonOfOrganization::getUsername)
                .toList();
        assertThat(remainingUsernamesInOrganization).containsExactlyInAnyOrder("orgamanager", "orgamember");
    }

    @Test
    @Transactional
    public void leaveOrganizationAsLastManagerShouldDeleteOrganization() {
        organizationService.leaveOrganization(1);
        organizationService.leaveOrganization(3);
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.getOrganizationById(3));
        KollappUser kollappUser = kollappUserRepository.findByUsername("nina").orElse(new KollappUser());
        assertThat(kollappUser.getRole()).isEqualTo(SystemRole.ROLE_KOLLAPP_USER);
    }

    @Test
    public void leaveOrganizationWithWrongIdShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class).isThrownBy(
                () -> organizationService.leaveOrganization(2)
        );

        assertThatExceptionOfType(OrganizationNotFoundException.class).isThrownBy(
                () -> organizationService.leaveOrganization(4)
        );
    }

    @Test
    @Transactional
    public void updatePersonOfOrganizationOfUserShouldUpdatePersonOfOrganization() {
        organizationService.updatePersonOfOrganizationsOfUser(1, "ninaa");
        Organization organization = organizationRepository.findById(1).orElseThrow();
        assertThat(organization.getPersonsOfOrganization()
                .stream()
                .filter(p -> p.getUsername().equals("ninaa")).toList()
        ).isNotEmpty();
    }

    @Test
    public void grantRoleToPersonOfOrganizationShouldGrantRole() {
        Organization organization = organizationService
                .grantRoleToPersonOfOrganization(1, 3, OrganizationRole.ROLE_ORGANIZATION_MEMBER);
        PersonOfOrganization personOfOrganization = organization.getPersonsOfOrganization()
                .stream()
                .filter(p -> p.getUserId() == 3)
                .findFirst()
                .orElse(new PersonOfOrganization());
        assertThat(personOfOrganization.getOrganizationRole()).isEqualTo(OrganizationRole.ROLE_ORGANIZATION_MEMBER);
        assertThat(organization.getManagers().size()).isEqualTo(1);
    }

    @Test
    public void grantRoleToWrongPersonOfOrganizationShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService
                        .grantRoleToPersonOfOrganization(1, 4, OrganizationRole.ROLE_ORGANIZATION_MEMBER));

        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService
                        .grantRoleToPersonOfOrganization(2, 4, OrganizationRole.ROLE_ORGANIZATION_MEMBER));

        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService
                        .grantRoleToPersonOfOrganization(4, 3, OrganizationRole.ROLE_ORGANIZATION_MEMBER));

        assertThatExceptionOfType(PersonAlreadyHasTargetRoleException.class)
                .isThrownBy(() -> organizationService
                        .grantRoleToPersonOfOrganization(1, 3, OrganizationRole.ROLE_ORGANIZATION_MANAGER));
    }

    @Test
    public void getOrganizationsByLoggedInUserShouldReturnListWithTwoOrganizations() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations.size()).isEqualTo(2);
        assertThat(organizations.stream().map(Organization::getName).toList())
                .containsExactlyInAnyOrder("NMS", "Glitzerglanz");
    }

    @Test
    public void getOrganizationByIdShouldReturnOrganization() {
        Organization organization = organizationService.getOrganizationById(1);
        assertThat(organization.getId()).isEqualTo(1);
        assertThat(organization.getName()).isEqualTo("NMS");
    }

    @Test
    public void getOrganizationByWrongIdShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.getOrganizationById(2));
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.getOrganizationById(4));
    }

    @Test
    public void getOrganizationByInvitationCodeShouldReturnOrganization() {
        Organization organization = organizationService.getOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(2);
        assertThat(organization.getName()).isEqualTo("Frequenzfamilie");
    }

    @Test
    public void getOrganizationByWrongInvitationCodeShouldThrowException() {
        assertThatExceptionOfType(InvalidInvitationCodeException.class)
                .isThrownBy(() -> organizationService.getOrganizationByInvitationCode("asdfjkloo"));

    }

}
