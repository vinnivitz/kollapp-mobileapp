package org.kollapp.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import org.kollapp.core.BaseIT;
import org.kollapp.organization.application.exception.LastManagerException;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.repository.PersonOfOrganizationRepository;
import org.kollapp.user.application.exception.IncorrectPasswordException;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.repository.KollappUserRepository;
import org.kollapp.user.application.service.KollappUserService;

@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
public class KollappUserDeletedEventIT extends BaseIT {

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private KollappUserRepository kollappUserRepository;

    @Autowired
    private PersonOfOrganizationRepository personOfOrganizationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @Sql(
            scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
            executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void deleteKollappUserShouldBeBlockedIfUserIsLastManagerAndOtherMembersExist() {
        KollappUser nina = kollappUserRepository.findByUsername("nina").orElseThrow();
        nina.setPassword(passwordEncoder.encode("correctPassword"));
        kollappUserRepository.save(nina);

        assertThatExceptionOfType(LastManagerException.class)
                .isThrownBy(() -> kollappUserService.deleteKollappUser("correctPassword"));

        assertThat(kollappUserRepository.findById(1L)).isPresent();
        assertThat(personOfOrganizationRepository.findByUserId(1L)).isNotEmpty();
        assertThat(organizationRepository.findById(1L)).isPresent();
        assertThat(organizationRepository.findById(3L)).isPresent();
    }

    @Test
    @Sql(
            scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
            executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    @WithMockUser(
            username = "member",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void deleteKollappUserShouldDeleteUserAndMembershipsIfUserIsNotManager() {
        KollappUser member = kollappUserRepository.findByUsername("member").orElseThrow();
        member.setPassword(passwordEncoder.encode("correctPassword"));
        kollappUserRepository.save(member);

        kollappUserService.deleteKollappUser("correctPassword");

        assertThat(kollappUserRepository.findById(2L)).isEmpty();
        assertThat(personOfOrganizationRepository.findByUserId(2L)).isEmpty();
        assertThat(organizationRepository.findById(1L)).isPresent();
        assertThat(organizationRepository.findById(2L)).isPresent();
        assertThat(organizationRepository.findById(3L)).isPresent();
    }

    @Test
    @Sql(
            scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
            executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    @WithMockUser(
            username = "nina",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void deleteKollappUserShouldNotDeleteAnythingIfPasswordIsIncorrect() {
        KollappUser nina = kollappUserRepository.findByUsername("nina").orElseThrow();
        nina.setPassword(passwordEncoder.encode("correctPassword"));
        kollappUserRepository.save(nina);

        assertThatExceptionOfType(IncorrectPasswordException.class)
                .isThrownBy(() -> kollappUserService.deleteKollappUser("wrongPassword"));

        assertThat(kollappUserRepository.findById(1L)).isPresent();
        assertThat(personOfOrganizationRepository.findByUserId(1L)).isNotEmpty();
        assertThat(organizationRepository.findById(1L)).isPresent();
        assertThat(organizationRepository.findById(3L)).isPresent();
    }

    @Test
    @Sql(
            scripts = "/sql/organization/base_data_organization_single_manager.sql",
            executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
    @WithMockUser(
            username = "solo",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    public void deleteKollappUserShouldDeleteUserAndOrganizationIfUserIsSoleManagerAndNoOtherMembersExist() {
        KollappUser solo = kollappUserRepository.findByUsername("solo").orElseThrow();
        solo.setPassword(passwordEncoder.encode("correctPassword"));
        kollappUserRepository.save(solo);

        kollappUserService.deleteKollappUser("correctPassword");

        assertThat(kollappUserRepository.findById(10L)).isEmpty();
        assertThat(personOfOrganizationRepository.findByUserId(10L)).isEmpty();
        assertThat(organizationRepository.findById(10L)).isEmpty();
    }
}
