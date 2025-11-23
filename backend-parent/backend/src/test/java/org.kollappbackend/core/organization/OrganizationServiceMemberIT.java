package org.kollappbackend.core.organization;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.exception.InvalidInvitationCodeException;
import org.kollappbackend.organization.application.exception.OrganizationAuthorizationException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PersonAlreadyRegisteredInOrganizationException;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.OrganizationRole;
import org.kollappbackend.organization.application.model.PersonOfOrganization;
import org.kollappbackend.organization.application.model.PersonOfOrganizationStatus;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

@Sql(scripts = "/sql/organization/base_data_organization_kollapp_orga_member_approved.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql",
        executionPhase = AFTER_TEST_METHOD)
@WithMockUser(username = "nina", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
public class OrganizationServiceMemberIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    public void createOrganizationShouldCreateOrganization() {
        Organization organizationDummy = Organization.builder()
                .place("Testort")
                .name("Testorga")
                .description("Testbeschreibung")
                .build();
        Organization organization  = organizationService
                .createOrganization(organizationDummy);
        assertThat(organization.getId()).isNotZero();
        assertThat(organization.getName()).isEqualTo("Testorga");
        assertThat(organization.getDescription()).isEqualTo("Testbeschreibung");
        assertThat(organization.getPlace()).isEqualTo("Testort");
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
        assertThat(organization.getPersonsOfOrganization().getFirst().getUsername()).isEqualTo("nina");
        assertThat(organization.getOrganizationInvitationCode()).isNotNull();
    }

    @Test
    public void updateOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> organizationService.updateOrganization(new Organization(), 1));
    }

    @Test
    public void deleteUserFromOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(1,1));
    }

    @Test
    public void generateNewOrganizationInvitationCodeShouldThrowAuthException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> organizationService.generateNewOrganizationInvitationCode(1));
    }

    @Test
    @Transactional
    public void enterOrganizationByInvitationCodeShouldReturnEnteredOrganization() {
        Organization organization = organizationService.enterOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(2);
        assertThat(organization.getName()).isEqualTo("Frequenzfamilie");
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
        PersonOfOrganization personOfOrganization =  organization.getPersonsOfOrganization().getFirst();
        assertThat(personOfOrganization.getUsername()).isEqualTo("nina");
        assertThat(personOfOrganization.getOrganizationRole()).isEqualTo(OrganizationRole.ROLE_ORGANIZATION_MEMBER);
        assertThat(personOfOrganization.getStatus()).isEqualTo(PersonOfOrganizationStatus.PENDING);
    }

    @Test
    public void enterOrganizationWithWrongInvitationCodeShouldThrowException() {
        assertThatExceptionOfType(InvalidInvitationCodeException.class).isThrownBy(
                () ->  organizationService.enterOrganizationByInvitationCode("asdfjkl")
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
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
        assertThat(organization.getPersonsOfOrganization().getFirst().getUsername()).isEqualTo("orgamanager");
    }

    @Test
    public void leaveOrganizationWithWrongIdShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class).isThrownBy(
                () ->  organizationService.leaveOrganization(2)
        );
        assertThatExceptionOfType(OrganizationNotFoundException.class).isThrownBy(
                () ->  organizationService.leaveOrganization(3)
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
    public void grantRoleToPersonOfOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(1,2,null));
    }

    @Test
    public void getOrganizationsByLoggedInUserShouldReturnListWithOneOrganization() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations.size()).isEqualTo(1);
        assertThat(organizations.getFirst().getName()).isEqualTo("NMS");
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
                .isThrownBy(() -> organizationService.getOrganizationById(3));
    }

    @Test
    public void getOrganizationByInvitationCodeShouldReturnOrganization() {
        Organization organization = organizationService.getOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(2);
        assertThat(organization.getName()).isEqualTo("Frequenzfamilie");
    }

    @Test
    public void approveNewMemberShouldThrowAuthException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> organizationService.approveNewMemberRequest(1, 1));
    }
}
