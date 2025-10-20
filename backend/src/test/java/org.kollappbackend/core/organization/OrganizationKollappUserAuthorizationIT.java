package org.kollappbackend.core.organization;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

@Sql(scripts = "/sql/organization/organization_authorization.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
@WithMockUser(username = "nina", authorities = { "ROLE_KOLLAPP_USER" })
public class OrganizationKollappUserAuthorizationIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;

    @Test
    public void createOrganizationShouldCreateOrganization() {
        Organization organization = organizationService
                .createOrganization(Organization.builder().name("testorga").build());
        organization.getPersonsOfOrganization().get(0);
        assertThat(organization.getName()).isEqualTo("testorga");
    }

    @Test
    public void updateOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.updateOrganization(new Organization(), 1));
    }

    @Test
    public void deleteUserFromOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(1,1));
    }

    @Test
    public void generateNewOrganizationInvitationCodeShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.generateNewOrganizationInvitationCode(1));
    }

    @Test
    @Disabled
    public void enterOrganizationByInvitationCodeShouldNotThrowAuthException() {

    }

    @Test
    @Disabled
    public void deleteUserFromOrganizationsShouldNotThrowAuthException() {

    }

    @Test
    public void leaveOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.leaveOrganization(1));
    }

    @Test
    public void updatePersonOfOrganizationOfUserShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.updatePersonOfOrganizationsOfUser(1,"test"));
    }

    @Test
    public void grantRoleToPersonOfOrganizationShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(1,2,"ROLE"));
    }

    @Test
    @Disabled
    public void getOrganizationsByLoggedInUserShouldNotThrowAuthException() {

    }

    @Test
    public void getOrganizationByIdShouldThrowAuthException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> organizationService.getOrganizationById(1));
    }

    @Test
    @Disabled
    public void getOrganizationByInvitationCodeShouldNotThrowAuthException() {

    }
}
