package org.kollapp.organization;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import org.kollapp.core.BaseIT;
import org.kollapp.organization.application.exception.LastManagerException;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.repository.PersonOfOrganizationRepository;
import org.kollapp.organization.application.service.OrganizationService;

@Sql(
        scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
class OrganizationServiceUserDeletionIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private PersonOfOrganizationRepository personOfOrganizationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    void deleteUserFromAllOrganizations_shouldThrowLastManagerExceptionIfLastManagerAndOtherMembersExist() {
        assertThatExceptionOfType(LastManagerException.class)
                .isThrownBy(() -> organizationService.deleteUserFromAllOrganizations(1L));

        assertThat(personOfOrganizationRepository.findByUserId(1L)).hasSize(2);
        assertThat(organizationRepository.findById(1L)).isPresent();
        assertThat(organizationRepository.findById(3L)).isPresent();
    }

    @Test
    @Sql(
            scripts = "/sql/organization/base_data_organization_single_manager.sql",
            executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    void deleteUserFromAllOrganizations_shouldDeleteOrganizationIfLastManagerAndNoOtherMembersExist() {
        organizationService.deleteUserFromAllOrganizations(10L);

        assertThat(personOfOrganizationRepository.findByUserId(10L)).isEmpty();
        assertThat(organizationRepository.findById(10L)).isEmpty();
    }

    @Test
    void deleteUserFromAllOrganizations_shouldDeleteMembershipsIfNotManager() {
        organizationService.deleteUserFromAllOrganizations(2L);

        assertThat(personOfOrganizationRepository.findByUserId(2L)).isEmpty();
        assertThat(organizationRepository.findById(1L)).isPresent();
        assertThat(organizationRepository.findById(2L)).isPresent();
        assertThat(organizationRepository.findById(3L)).isPresent();
    }
}
