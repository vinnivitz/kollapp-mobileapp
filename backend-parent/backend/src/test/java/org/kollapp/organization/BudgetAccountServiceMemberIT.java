package org.kollapp.organization;

import java.util.Optional;

import jakarta.transaction.Transactional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import org.kollapp.core.BaseIT;
import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.OrganizationAuthorizationException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PostingDoesNotExistException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.ActivityPosting;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.model.OrganizationPosting;
import org.kollapp.organization.application.model.Posting;
import org.kollapp.organization.application.model.PostingType;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.BudgetAccountService;

@Sql(
        scripts = "/sql/organization/base_data_organization_kollapp_orga_member_approved.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
public class BudgetAccountServiceMemberIT extends BaseIT {

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    public void addOrganizationPostingWithOwnIdShouldCreateOrganizationPosting() {
        OrganizationPosting organizationPosting =
                new OrganizationPosting(PostingType.DEBIT, 1000L, "2025-09-11", "test", null, 1);
        Posting persistedPosting = budgetAccountService.addOrganizationPosting(1, organizationPosting);
        assertThat(persistedPosting.getId()).isNotZero();
        assertThat(persistedPosting.getDate()).isEqualTo(organizationPosting.getDate());
        assertThat(persistedPosting.getPersonOfOrganizationId())
                .isEqualTo(organizationPosting.getPersonOfOrganizationId());
    }

    @Test
    public void addOrganizationPostingWithWrongIdShouldThrowException() {
        OrganizationPosting organizationPosting = new OrganizationPosting();
        organizationPosting.setPersonOfOrganizationId(2);
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.addOrganizationPosting(1, new OrganizationPosting()));
    }

    @Test
    public void editOrganizationPostingWithOwnIdShouldUpdateOrganizationPosting() {
        OrganizationPosting updatedPosting = new OrganizationPosting();
        updatedPosting.setPersonOfOrganizationId(1);
        updatedPosting.setPurpose("updated");
        updatedPosting.setDate("2025-09-11");
        updatedPosting.setType(PostingType.DEBIT);
        Posting posting = budgetAccountService.editOrganizationPosting(1, 1, updatedPosting);
        assertThat(posting.getPersonOfOrganizationId()).isEqualTo(updatedPosting.getPersonOfOrganizationId());
        assertThat(posting.getPurpose()).isEqualTo(updatedPosting.getPurpose());
    }

    @Test
    public void editOrganizationPostingWithWrongIdShouldThrowException() {
        OrganizationPosting updatedPosting = new OrganizationPosting();
        updatedPosting.setPersonOfOrganizationId(2);
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.editOrganizationPosting(1, 1, updatedPosting));
    }

    @Test
    public void editWrongOrganizationPostingWithCorrectIdShouldThrowException() {
        OrganizationPosting organizationPosting = new OrganizationPosting();
        organizationPosting.setPersonOfOrganizationId(1);
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.editOrganizationPosting(1, 3, organizationPosting));
    }

    @Test
    public void deleteOrganizationPostingWithOwnIdShouldDeleteOrganizationPosting() {
        assertThatNoException().isThrownBy(() -> budgetAccountService.deleteOrganizationPosting(1, 1));
    }

    @Test
    public void deleteOrganizationPostingWithWrongIdShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.deleteOrganizationPosting(1, 3));
    }

    @Test
    public void transferOrganizationPostingShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.transferOrganizationPosting(1, 1));
    }

    @Test
    public void addActivityPostingWithOwnIdShouldCreateActivityPosting() {
        ActivityPosting activityPosting =
                new ActivityPosting(PostingType.CREDIT, 10000L, "2025-09-11", "test", null, 1);
        Posting persistedActivityPosting = budgetAccountService.addActivityPosting(1, 1, activityPosting);
        assertThat(persistedActivityPosting.getId()).isNotZero();
        assertThat(persistedActivityPosting.getDate()).isEqualTo(activityPosting.getDate());
        assertThat(persistedActivityPosting.getType()).isEqualTo(activityPosting.getType());
        assertThat(persistedActivityPosting.getPurpose()).isEqualTo(activityPosting.getPurpose());
        assertThat(persistedActivityPosting.getPersonOfOrganizationId())
                .isEqualTo(activityPosting.getPersonOfOrganizationId());
        assertThat(((ActivityPosting) persistedActivityPosting).getActivity().getId())
                .isEqualTo(1L);
    }

    @Test
    public void addActivityPostingWithWrongIdShouldThrowException() {
        ActivityPosting activityPosting =
                new ActivityPosting(PostingType.CREDIT, 10000L, "2025-09-11", "test", null, 2);
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.addActivityPosting(1, 1, activityPosting));
    }

    @Test
    public void addActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.addActivityPosting(3, 1, new ActivityPosting()));
    }

    @Test
    public void addActivityPostingForNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.addActivityPosting(1, 2, new ActivityPosting()));
    }

    @Test
    public void editActivityPostingWithOwnIdShouldEditActivityPosting() {
        ActivityPosting activityPosting =
                new ActivityPosting(PostingType.CREDIT, 10000L, "2025-09-11", "test_bearbeitet", null, 1);
        Posting editedActivityPosting = budgetAccountService.editActivityPosting(1, 1, 2, activityPosting);
        assertThat(editedActivityPosting.getId()).isEqualTo(2);
        assertThat(editedActivityPosting.getDate()).isEqualTo(activityPosting.getDate());
        assertThat(editedActivityPosting.getType()).isEqualTo(activityPosting.getType());
        assertThat(editedActivityPosting.getPurpose()).isEqualTo(activityPosting.getPurpose());
        assertThat(((ActivityPosting) editedActivityPosting).getActivity().getId())
                .isEqualTo(1L);
        assertThat(editedActivityPosting.getPersonOfOrganizationId())
                .isEqualTo(activityPosting.getPersonOfOrganizationId());
    }

    @Test
    public void editActivityPostingWithWrongIdShouldThrowException() {
        ActivityPosting activityPosting = new ActivityPosting();
        activityPosting.setPersonOfOrganizationId(2);
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(1, 1, 2, activityPosting));
    }

    @Test
    public void editWrongActivityPostingWithCorrectIdShouldThrowException() {
        ActivityPosting activityPosting = new ActivityPosting();
        activityPosting.setPersonOfOrganizationId(1);
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(1, 1, 4, activityPosting));
    }

    @Test
    public void editActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(3, 1, 1, new ActivityPosting()));
    }

    @Test
    public void editActivityPostingForNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(1, 2, 1, new ActivityPosting()));
    }

    @Test
    public void editActivityPostingForNonExistingPostingShouldThrowException() {
        assertThatExceptionOfType(PostingDoesNotExistException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(1, 1, 5, new ActivityPosting()));
    }

    @Test
    @Transactional
    public void deleteActivityPostingWithOwnIdShouldDeleteActivityPosting() {
        budgetAccountService.deleteActivityPosting(1, 1, 2);
        Optional<Organization> orga = organizationRepository.findById(1L);
        assertThat(orga).isPresent();
        Optional<Activity> activity =
                orga.get().getActivities().stream().filter(a -> a.getId() == 1L).findFirst();
        assertThat(activity).isPresent();
        assertThat(activity.get().getActivityPostings().size()).isEqualTo(1);
    }

    @Test
    @Transactional
    public void deleteActivityPostingWithWrongIdShouldDeleteActivityPosting() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.deleteActivityPosting(1, 1, 4));
    }

    @Test
    public void deleteActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.deleteActivityPosting(3, 1, 1));
    }

    @Test
    public void deleteActivityPostingForNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.deleteActivityPosting(1, 2, 1));
    }

    @Test
    public void deleteActivityPostingForNonExistingPostingShouldThrowException() {
        assertThatExceptionOfType(PostingDoesNotExistException.class)
                .isThrownBy(() -> budgetAccountService.deleteActivityPosting(1, 1, 5));
    }

    @Test
    public void transferActivityPostingShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.transferActivityPosting(1, 1, 1));
    }
}
