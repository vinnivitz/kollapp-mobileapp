package org.kollappbackend.core.organization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import jakarta.transaction.Transactional;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.exception.ActivityNotFoundException;
import org.kollappbackend.organization.application.exception.OrganizationAuthorizationException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PostingDoesNotExistException;
import org.kollappbackend.organization.application.model.Activity;
import org.kollappbackend.organization.application.model.ActivityPosting;
import org.kollappbackend.organization.application.model.Organization;
import org.kollappbackend.organization.application.model.OrganizationPosting;
import org.kollappbackend.organization.application.model.Posting;
import org.kollappbackend.organization.application.model.PostingType;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.service.BudgetAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

@Sql(
        scripts = "/sql/organization/base_data_organization_kollapp_orga_member_approved.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
public class BudgetAccountServiceMemberIT extends BaseIT {

    @Autowired private BudgetAccountService budgetAccountService;

    @Autowired private OrganizationRepository organizationRepository;

    @Test
    public void addOrganizationPostingShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(
                        () ->
                                budgetAccountService.addOrganizationPosting(
                                        1, new OrganizationPosting()));
    }

    @Test
    public void editOrganizationPostingShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(
                        () ->
                                budgetAccountService.editOrganizationPosting(
                                        1, 1, new OrganizationPosting()));
    }

    @Test
    public void deleteOrganizationPostingShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> budgetAccountService.deleteOrganizationPosting(1, 1));
    }

    @Test
    public void addActivityPostingShouldCreateActivityPosting() {
        ActivityPosting activityPosting =
                new ActivityPosting(PostingType.CREDIT, 10000L, "2025-09-11", "test", null);
        Posting persistedActivityPosting =
                budgetAccountService.addActivityPosting(1, 1, activityPosting);
        assertThat(persistedActivityPosting.getId()).isNotZero();
        assertThat(persistedActivityPosting.getDate()).isEqualTo(activityPosting.getDate());
        assertThat(persistedActivityPosting.getType()).isEqualTo(activityPosting.getType());
        assertThat(persistedActivityPosting.getPurpose()).isEqualTo(activityPosting.getPurpose());
        assertThat(((ActivityPosting) persistedActivityPosting).getActivity().getId())
                .isEqualTo(1L);
    }

    @Test
    public void addActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(
                        () -> budgetAccountService.addActivityPosting(3, 1, new ActivityPosting()));
    }

    @Test
    public void addActivityPostingForNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(
                        () -> budgetAccountService.addActivityPosting(1, 2, new ActivityPosting()));
    }

    @Test
    public void editActivityPostingShouldEditActivityPosting() {
        ActivityPosting activityPosting =
                new ActivityPosting(
                        PostingType.CREDIT, 10000L, "2025-09-11", "test_bearbeitet", null);
        Posting editedActivityPosting =
                budgetAccountService.editActivityPosting(1, 1, 1, activityPosting);
        assertThat(editedActivityPosting.getId()).isEqualTo(1);
        assertThat(editedActivityPosting.getDate()).isEqualTo(activityPosting.getDate());
        assertThat(editedActivityPosting.getType()).isEqualTo(activityPosting.getType());
        assertThat(editedActivityPosting.getPurpose()).isEqualTo(activityPosting.getPurpose());
        assertThat(((ActivityPosting) editedActivityPosting).getActivity().getId()).isEqualTo(1L);
    }

    @Test
    public void editActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(
                        () ->
                                budgetAccountService.editActivityPosting(
                                        3, 1, 1, new ActivityPosting()));
    }

    @Test
    public void editActivityPostingForNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(
                        () ->
                                budgetAccountService.editActivityPosting(
                                        1, 2, 1, new ActivityPosting()));
    }

    @Test
    public void editActivityPostingForNonExistingPostingShouldThrowException() {
        assertThatExceptionOfType(PostingDoesNotExistException.class)
                .isThrownBy(
                        () ->
                                budgetAccountService.editActivityPosting(
                                        1, 1, 2, new ActivityPosting()));
    }

    @Test
    @Transactional
    public void deleteActivityPostingShouldDeleteActivityPosting() {
        budgetAccountService.deleteActivityPosting(1, 1, 1);
        Optional<Organization> orga = organizationRepository.findById(1L);
        assertThat(orga).isPresent();
        Optional<Activity> activity =
                orga.get().getActivities().stream().filter(a -> a.getId() == 1L).findFirst();
        assertThat(activity).isPresent();
        assertThat(activity.get().getActivityPostings().size()).isEqualTo(0);
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
                .isThrownBy(() -> budgetAccountService.deleteActivityPosting(1, 1, 2));
    }
}
