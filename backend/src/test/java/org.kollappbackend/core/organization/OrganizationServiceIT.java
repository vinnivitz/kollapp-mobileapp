package org.kollappbackend.core.organization;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.service.OrganizationService;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.model.SystemRole;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@Transactional
public class OrganizationServiceIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;

    @MockBean
    private KollappUserService kollappUserService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @BeforeEach
    public void beforeEach() {
        KollappUser mockUser = KollappUser.builder()
                .id(1L)
                .username("erika")
                .build();
        when(kollappUserService.getLoggedInKollappUser()).thenReturn(mockUser);
    }

    @Test
    @Sql("/sql/organization/organization_with_single_manager.sql")
    @WithMockUser(username = "erika", authorities = { "ROLE_KOLLAPP_USER" })
    public void getOrganizationsByLoggedInUser() {
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations.getFirst().getId()).isEqualTo(1L);
        assertThat(organizations.getFirst().getName()).isEqualTo("NMS");
    }

    @Test
    @WithMockUser(username = "erika", authorities = { "ROLE_KOLLAPP_USER" })
    public void createOrganizationOfLoggedInUser() {
        Organization organizationToPersist = Organization.builder().name("NMS").build();
        Organization persistedOrganization = organizationService.createOrganization(organizationToPersist);
        assertThat(persistedOrganization.getId()).isNotZero();
        assertThat(persistedOrganization.getPersonsOfOrganization().size()).isEqualTo(1);
        assertThat(persistedOrganization.getPersonsOfOrganization().getFirst().getUserId()).isEqualTo(1L);
    }

    @Test
    @Sql("/sql/organization/organization_with_single_manager.sql")
    @WithMockUser(username = "erika", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
    public void editOrganizationOfLoggedInUser() {
        Organization organization = Organization.builder().name("Frequenzfamilie").build();
        organizationService.updateOrganization(organization, 1);
        List<Organization> updatedOrganizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(updatedOrganizations.getFirst().getName()).isEqualTo("Frequenzfamilie");
    }

    @Test
    @Sql("/sql/organization/organization_with_two_managers.sql")
    @WithMockUser(username = "erika", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
    public void leaveOrganizationWithRemainingManager() {
        mockRoles();
        organizationService.leaveOrganization(1);
        Organization organization = organizationRepository.findById(1).get();
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
    }

    @Test
    @Sql("/sql/organization/organization_with_single_manager.sql")
    @WithMockUser(username = "erika", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
    public void leaveOrganizationWithNoRemainingManager() {
        mockRoles();
        organizationService.leaveOrganization(1);
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations.size()).isEqualTo(0);
    }

    @Test
    @Sql("/sql/organization/organization_with_manager_and_member.sql")
    @WithMockUser(username = "erika", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
    public void leaveOrganizationWithNoRemainingManagerButMember() {
        mockRoles();
        organizationService.leaveOrganization(1);
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations.size()).isEqualTo(0);
    }

    @Test
    @Sql("/sql/organization/organization_with_manager_and_member.sql")
    @WithMockUser(username = "erika", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
    public void deleteUserFromOrganization() {
        organizationService.deleteUserFromOrganization(2, 1);
        List<Organization> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations.getFirst().getPersonsOfOrganization().size()).isEqualTo(1);
    }

    private void mockRoles() {
        KollappUser mockUser = KollappUser.builder()
                .id(1L)
                .username("erika")
                .role(SystemRole.ROLE_KOLLAPP_ORGANIZATION_MEMBER)
                .build();
        when(kollappUserService.getLoggedInKollappUser()).thenReturn(mockUser);
    }
}