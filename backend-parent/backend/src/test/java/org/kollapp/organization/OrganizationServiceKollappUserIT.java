package org.kollapp.organization;

import java.util.List;

import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import org.kollapp.core.BaseIT;
import org.kollapp.organization.application.exception.InvalidInvitationCodeException;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationRole;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.model.PersonOfOrganizationStatus;
import org.kollapp.organization.application.service.OrganizationService;

@Sql(
        scripts = "/sql/organization/base_data_organization_kollapp_user.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
@Sql(scripts = "/sql/clear.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_CLASS)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_USER"})
public class OrganizationServiceKollappUserIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;

    @Test
    public void createOrganizationShouldCreateOrganization() {
        Organization organizationDummy = Organization.builder()
                .place("Testort")
                .name("Testorga")
                .description("Testbeschreibung")
                .build();
        Organization organization = organizationService.createOrganization(organizationDummy);
        assertThat(organization.getId()).isNotZero();
        assertThat(organization.getName()).isEqualTo("Testorga");
        assertThat(organization.getDescription()).isEqualTo("Testbeschreibung");
        assertThat(organization.getPlace()).isEqualTo("Testort");
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
        assertThat(organization.getPersonsOfOrganization().getFirst().getUsername())
                .isEqualTo("nina");
        assertThat(organization.getOrganizationInvitationCode()).isNotNull();
    }

    @Test
    public void updateOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.updateOrganization(new Organization(), 1));
    }

    @Test
    public void deleteUserFromOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(1, 1));
    }

    @Test
    public void generateNewOrganizationInvitationCodeShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.generateNewOrganizationInvitationCode(1));
    }

    @Test
    @Transactional
    public void enterOrganizationByInvitationCodeShouldReturnEnteredOrganization() {
        organizationService.enterOrganizationByInvitationCode("asdfjklo");
        Organization organization = organizationService.getOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(1);
        assertThat(organization.getName()).isEqualTo("NMS");
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
        PersonOfOrganization personOfOrganization =
                organization.getPersonsOfOrganization().getFirst();
        assertThat(personOfOrganization.getUsername()).isEqualTo("nina");
        assertThat(personOfOrganization.getOrganizationRole()).isEqualTo(OrganizationRole.ROLE_ORGANIZATION_MEMBER);
        assertThat(personOfOrganization.getStatus()).isEqualTo(PersonOfOrganizationStatus.PENDING);
    }

    @Test
    public void enterOrganizationWithWrongInvitationCodeShouldThrowException() {
        assertThatExceptionOfType(InvalidInvitationCodeException.class)
                .isThrownBy(() -> organizationService.enterOrganizationByInvitationCode("asdfjkl"));
    }

    @Test
    public void leaveOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.leaveOrganization(1));
    }

    @Test
    @WithMockUser(
            username = "nina",
            authorities = {})
    public void updatePersonOfOrganizationOfUserWithoutKollappUserRoleShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.updatePersonOfOrganizationsOfUser(1, "test"));
    }

    @Test
    public void grantRoleToPersonOfOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(1, 2, null));
    }

    @Test
    public void getOrganizationsByLoggedInUserShouldReturnEmptyList() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations).isEmpty();
    }

    @Test
    public void getOrganizationByIdShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.getOrganizationById(1));
    }

    @Test
    public void getOrganizationByInvitationCodeShouldReturnOrganization() {
        Organization organization = organizationService.getOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(1);
        assertThat(organization.getName()).isEqualTo("NMS");
    }

    @Test
    public void approveNewMemberShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.approveNewMemberRequest(1, 1));
    }
}
