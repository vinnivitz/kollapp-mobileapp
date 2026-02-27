package org.kollapp.organization;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import org.kollapp.core.BaseIT;
import org.kollapp.organization.application.exception.BudgetCategoryNotFoundException;
import org.kollapp.organization.application.exception.BudgetCategoryWithNameExistsException;
import org.kollapp.organization.application.exception.DefaultBudgetCategoryMustNotBeDeletedException;
import org.kollapp.organization.application.exception.DefaultFlagOfBudgetCategoryMustNotBeRevokedException;
import org.kollapp.organization.application.exception.InvalidInvitationCodeException;
import org.kollapp.organization.application.exception.LastManagerException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonAlreadyHasTargetRoleException;
import org.kollapp.organization.application.exception.PersonAlreadyRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.exception.SelfActionNotAllowedException;
import org.kollapp.organization.application.exception.UntransferredPostingException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationBudgetCategory;
import org.kollapp.organization.application.model.OrganizationMembershipState;
import org.kollapp.organization.application.model.OrganizationMinified;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.OrganizationRole;
import org.kollapp.organization.application.model.PersonOfOrganization;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.OrganizationService;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.SystemRole;
import org.kollapp.user.application.repository.KollappUserRepository;
import org.kollapp.user.application.service.KollappUserService;

@Sql(
        scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
public class OrganizationServiceManagerIT extends BaseIT {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private KollappUserRepository kollappUserRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void createOrganizationShouldCreateOrganization() {
        LocalDate now = LocalDate.now();
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
        assertThat(organization.getOrganizationInvitationCode().getExpirationDate())
                .isEqualTo(now.plusDays(3).toString());
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(1);
        assertThat(organization.getPersonsOfOrganization().getFirst().getUsername())
                .isEqualTo("nina");
        assertThat(organization.getOrganizationInvitationCode()).isNotNull();
        assertThat(organization.getBudgetCategories().size()).isEqualTo(1);
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
    public void deleteUserFromTheirLastOrganizationWithUntransferredPostingsShouldThrowException() {
        assertThatExceptionOfType(UntransferredPostingException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(3, 1));
    }

    @Test
    @Transactional
    public void deleteUserFromTheirLastOrganizationShouldDowngradeRoleAndDeleteThemFromOrganization() {
        transferUntransferredOrganizationPosting();
        Organization organization = organizationService.deleteUserFromOrganization(3, 1);
        assertThat(organization.getPersonsOfOrganization().stream().mapToLong(PersonOfOrganization::getId))
                .doesNotContain(3L);
        KollappUser kollappUser = kollappUserRepository.findById(3L).orElse(new KollappUser());
        assertThat(kollappUser.getRole()).isEqualTo(SystemRole.ROLE_KOLLAPP_USER);
    }

    @Test
    public void deleteUserFromOrganizationShouldDeleteThemFromOrganization() {
        Organization organization = organizationService.deleteUserFromOrganization(2, 1);
        assertThat(organization.getPersonsOfOrganization().stream().mapToLong(PersonOfOrganization::getId))
                .doesNotContain(2L);
        KollappUser kollappUser = kollappUserRepository.findById(2L).orElse(new KollappUser());
        assertThat(kollappUser.getRole()).isEqualTo(SystemRole.ROLE_KOLLAPP_ORGANIZATION_MEMBER);
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
    public void deleteOwnUserFromOrganizationShouldThrowException() {
        assertThatExceptionOfType(SelfActionNotAllowedException.class)
                .isThrownBy(() -> organizationService.deleteUserFromOrganization(1, 1));
    }

    @Test
    public void generateNewOrganizationInvitationCodeShouldReturnNewCode() {
        LocalDate now = LocalDate.now();
        String currentInvitationCode = organizationService
                .getOrganizationById(1)
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
        organizationService.enterOrganizationByInvitationCode("asdfjklo");
        OrganizationMinified organization = organizationService.getOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(2);
        assertThat(organization.getName()).isEqualTo("Frequenzfamilie");
        assertThat(organization.getState()).isEqualTo(OrganizationMembershipState.PENDING);
    }

    @Test
    public void enterOrganizationWithWrongInvitationCodeShouldThrowException() {
        assertThatExceptionOfType(InvalidInvitationCodeException.class)
                .isThrownBy(() -> organizationService.enterOrganizationByInvitationCode("asdfjkl"));
    }

    @Test
    public void enterOrganizationWithInvitationCodeTwiceShouldThrowException() {
        assertThatExceptionOfType(PersonAlreadyRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.enterOrganizationByInvitationCode("asdfjk01"));
    }

    @Test
    @Transactional
    public void leaveOrganizationWithUntransferredActivityPostingShouldThrowException() {
        assertThatExceptionOfType(UntransferredPostingException.class)
                .isThrownBy(() -> organizationService.leaveOrganization(1));
    }

    @Test
    @Transactional
    public void leaveOrganizationShouldRemoveUserFromOrganization() {
        Organization organization = organizationRepository.findById(1).orElseThrow();
        transferUntransferredActivityPosting();
        organizationService.leaveOrganization(1);
        assertThat(organization.getPersonsOfOrganization().size()).isEqualTo(2);
        List<String> remainingUsernamesInOrganization = organization.getPersonsOfOrganization().stream()
                .map(PersonOfOrganization::getUsername)
                .toList();
        assertThat(remainingUsernamesInOrganization).containsExactlyInAnyOrder("orgamanager", "orgamember");
    }

    @Test
    @Transactional
    public void leaveOrganizationAsLastManagerShouldDeleteOrganization() {
        transferUntransferredActivityPosting();
        organizationService.leaveOrganization(1);
        organizationService.leaveOrganization(3);
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.getOrganizationById(3));
        KollappUser kollappUser = kollappUserRepository.findByUsername("nina").orElse(new KollappUser());
        assertThat(kollappUser.getRole()).isEqualTo(SystemRole.ROLE_KOLLAPP_USER);
    }

    @Test
    public void leaveOrganizationWithWrongIdShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.leaveOrganization(2));

        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.leaveOrganization(4));
    }

    @Test
    @Transactional
    public void updatePersonOfOrganizationOfUserShouldUpdatePersonOfOrganization() {
        organizationService.updatePersonOfOrganizationsOfUser(1, "ninaa");
        Organization organization = organizationRepository.findById(1).orElseThrow();
        assertThat(organization.getPersonsOfOrganization().stream()
                        .filter(p -> p.getUsername().equals("ninaa"))
                        .toList())
                .isNotEmpty();
    }

    @Test
    public void grantRoleToPersonOfOrganizationShouldGrantRole() {
        Organization organization =
                organizationService.grantRoleToPersonOfOrganization(1, 3, OrganizationRole.ROLE_ORGANIZATION_MEMBER);
        PersonOfOrganization personOfOrganization = organization.getPersonsOfOrganization().stream()
                .filter(p -> p.getUserId() == 3)
                .findFirst()
                .orElse(new PersonOfOrganization());
        assertThat(personOfOrganization.getOrganizationRole()).isEqualTo(OrganizationRole.ROLE_ORGANIZATION_MEMBER);
        assertThat(organization.fetchManagers().size()).isEqualTo(1);
    }

    @Test
    public void grantRoleToWrongPersonOfOrganizationShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(
                        1, 4, OrganizationRole.ROLE_ORGANIZATION_MEMBER));

        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(
                        2, 4, OrganizationRole.ROLE_ORGANIZATION_MEMBER));

        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(
                        4, 3, OrganizationRole.ROLE_ORGANIZATION_MEMBER));

        assertThatExceptionOfType(PersonAlreadyHasTargetRoleException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(
                        1, 3, OrganizationRole.ROLE_ORGANIZATION_MANAGER));
    }

    @Test
    public void grantRoleToOwnUserShouldThrowException() {
        assertThatExceptionOfType(SelfActionNotAllowedException.class)
                .isThrownBy(() -> organizationService.grantRoleToPersonOfOrganization(
                        1, 1, OrganizationRole.ROLE_ORGANIZATION_MEMBER));
    }

    @Test
    public void getOrganizationsByLoggedInUserShouldReturnListWithTwoOrganizations() {
        List<OrganizationMinified> organizations = organizationService.getOrganizationsByLoggedInUser();
        assertThat(organizations.size()).isEqualTo(2);
        assertThat(organizations.stream().map(OrganizationMinified::getName).toList())
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
        OrganizationMinified organization = organizationService.getOrganizationByInvitationCode("asdfjklo");
        assertThat(organization.getId()).isEqualTo(2);
        assertThat(organization.getName()).isEqualTo("Frequenzfamilie");
    }

    @Test
    public void getOrganizationByWrongInvitationCodeShouldThrowException() {
        assertThatExceptionOfType(InvalidInvitationCodeException.class)
                .isThrownBy(() -> organizationService.getOrganizationByInvitationCode("asdfjkloo"));
    }

    @Test
    public void deleteUserWithUntransferredPostingsFromAllOrganizationsShouldThrowException() {
        KollappUser nina = kollappUserRepository.findByUsername("nina").orElseThrow();
        nina.setPassword(passwordEncoder.encode("test"));
        kollappUserRepository.save(nina);
        assertThatExceptionOfType(UntransferredPostingException.class)
                .isThrownBy(() -> kollappUserService.deleteKollappUser("test"));
    }

    @Test
    @Transactional
    public void deleteUserFromAllOrganizationsShouldThrowExceptionIfLastManager() {
        transferUntransferredActivityPosting();
        KollappUser nina = kollappUserRepository.findByUsername("nina").orElseThrow();
        nina.setPassword(passwordEncoder.encode("test"));
        kollappUserRepository.save(nina);
        assertThatExceptionOfType(LastManagerException.class)
                .isThrownBy(() -> kollappUserService.deleteKollappUser("test"));
    }

    @Test
    @WithMockUser(
            username = "member",
            authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
    @Transactional
    public void deleteUserFromAllOrganizationsShouldDeleteUser() {
        KollappUser member = kollappUserRepository.findByUsername("member").orElseThrow();
        member.setPassword(passwordEncoder.encode("test"));
        kollappUserRepository.save(member);
        kollappUserService.deleteKollappUser("test");
        assertThat(kollappUserRepository.findByUsername("member")).isEmpty();
        Optional<Organization> organization1 = organizationRepository.findById(1);
        Optional<Organization> organization3 = organizationRepository.findById(3);
        assertThat(organization1.isPresent()).isTrue();
        assertThat(organization3.isPresent()).isTrue();
        assertThat(organization1.get().getPersonsOfOrganization().size()).isEqualTo(2);
        assertThat(organization3.get().getPersonsOfOrganization().size()).isEqualTo(1);
    }

    private void transferUntransferredActivityPosting() {
        Organization organization = organizationRepository.findById(1).orElseThrow();
        Activity activity = organization.getActivityById(1);
        ActivityPosting untransferredPosting = activity.getActivityPostingById(1);
        untransferredPosting.transfer();
    }

    private void transferUntransferredOrganizationPosting() {
        Organization organization = organizationRepository.findById(1).orElseThrow();
        OrganizationPosting untransferredPosting = organization.getOrganizationPostingById(2);
        untransferredPosting.transfer();
    }

    @Test
    public void addNonDefaultBudgetCategoryShouldCreateBudgetCategory() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("test");
        budgetCategory.setDefaultCategory(false);
        Organization organization = organizationService.addBudgetCategory(1, budgetCategory);
        assertThat(organization.getBudgetCategories().size()).isEqualTo(4);
    }

    @Test
    public void addDefaultBudgetCategoryShouldCreateBudgetCategoryAndOverrideDefault() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("test");
        budgetCategory.setDefaultCategory(true);
        Organization organization = organizationService.addBudgetCategory(1, budgetCategory);
        List<OrganizationBudgetCategory> budgetCategories = organization.getBudgetCategories();
        List<OrganizationBudgetCategory> defaultBudgetCategories = budgetCategories.stream()
                .filter(OrganizationBudgetCategory::isDefaultCategory)
                .toList();
        assertThat(organization.getBudgetCategories().size()).isEqualTo(4);
        assertThat(defaultBudgetCategories.size()).isEqualTo(1);
        assertThat(defaultBudgetCategories.getFirst().getName()).isEqualTo(budgetCategory.getName());
    }

    @Test
    public void addBudgetCategoryWithExistingNameShouldThrowException() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("Category_2");
        budgetCategory.setDefaultCategory(false);
        assertThatExceptionOfType(BudgetCategoryWithNameExistsException.class)
                .isThrownBy(() -> organizationService.addBudgetCategory(1, budgetCategory));
    }

    @Test
    public void editBudgetCategoryNonDefaultShouldEditBudgetCategory() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("Category_edited");
        budgetCategory.setDefaultCategory(false);
        Organization organization = organizationService.editBudgetCategory(1, 2, budgetCategory);
        OrganizationBudgetCategory updatedBudgetCategory = organization.findBudgetCategoryById(2);
        assertThat(updatedBudgetCategory.getName()).isEqualTo(budgetCategory.getName());
    }

    @Test
    public void editBudgetCategoryDefaultShouldEditBudgetCategoryAndOverrideDefault() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("Category_edited");
        budgetCategory.setDefaultCategory(true);
        Organization organization = organizationService.editBudgetCategory(1, 2, budgetCategory);
        OrganizationBudgetCategory updatedBudgetCategory = organization.findBudgetCategoryById(2);
        assertThat(updatedBudgetCategory.getName()).isEqualTo(budgetCategory.getName());
        List<OrganizationBudgetCategory> budgetCategories = organization.getBudgetCategories();
        List<OrganizationBudgetCategory> defaultBudgetCategories = budgetCategories.stream()
                .filter(OrganizationBudgetCategory::isDefaultCategory)
                .toList();
        assertThat(defaultBudgetCategories.size()).isEqualTo(1);
        assertThat(defaultBudgetCategories.getFirst().getName()).isEqualTo(budgetCategory.getName());
    }

    @Test
    public void editBudgetCategoryWithNoChangesShouldEditBudgetCategory() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("Category_2");
        budgetCategory.setDefaultCategory(false);
        budgetCategory.setId(2);
        Organization organization = organizationService.editBudgetCategory(1, 2, budgetCategory);
        OrganizationBudgetCategory updatedBudgetCategory = organization.findBudgetCategoryById(2);
        assertThat(updatedBudgetCategory.getName()).isEqualTo(budgetCategory.getName());
    }

    @Test
    public void editBudgetCategoryWithWrongIdShouldThrowException() {
        assertThatExceptionOfType(BudgetCategoryNotFoundException.class)
                .isThrownBy(() -> organizationService.editBudgetCategory(1, 4, null));
    }

    @Test
    public void editDefaultBudgetCategoryToBeNonDefaultShouldThrowException() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("Category_edited");
        budgetCategory.setDefaultCategory(false);
        assertThatExceptionOfType(DefaultFlagOfBudgetCategoryMustNotBeRevokedException.class)
                .isThrownBy(() -> organizationService.editBudgetCategory(1, 1, budgetCategory));
    }

    @Test
    public void editBudgetCategoryToExistingNameShouldThrowException() {
        OrganizationBudgetCategory budgetCategory = new OrganizationBudgetCategory();
        budgetCategory.setName("Category_2");
        budgetCategory.setDefaultCategory(false);
        assertThatExceptionOfType(BudgetCategoryWithNameExistsException.class)
                .isThrownBy(() -> organizationService.editBudgetCategory(1, 3, budgetCategory));
    }

    @Test
    public void deleteDefaultBudgetCategoryShouldThrowException() {
        assertThatExceptionOfType(DefaultBudgetCategoryMustNotBeDeletedException.class)
                .isThrownBy(() -> organizationService.deleteBudgetCategory(1, 1));
    }

    @Test
    public void deleteNonDefaultBudgetCategoryShouldDeleteBudgetCategory() {
        organizationService.deleteBudgetCategory(1, 2);
        Organization organization = organizationService.getOrganizationById(1);
        assertThat(organization.getBudgetCategories().size()).isEqualTo(2);
    }

    @Test
    public void deleteBudgetCategoryWithWrongIdShouldThrowException() {
        assertThatExceptionOfType(BudgetCategoryNotFoundException.class)
                .isThrownBy(() -> organizationService.deleteBudgetCategory(1, 4));
    }
}
