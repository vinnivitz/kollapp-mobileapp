package org.kollappbackend.core.organization;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.exception.ActivityNotFoundException;
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

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

@Sql(scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql",
        executionPhase = AFTER_TEST_METHOD)
@WithMockUser(username = "nina", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
public class BudgetAccountServiceManagerIT extends BaseIT {

    @Autowired
    private BudgetAccountService budgetAccountService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    public void addOrganizationPostingShouldAddOrganizationPosting() {
        OrganizationPosting organizationPosting = new OrganizationPosting(
                PostingType.CREDIT, 10000L, "2025-09-11", "Test", null
        );
        Posting persistedPosting = budgetAccountService.addOrganizationPosting(1, organizationPosting);
        assertThat(persistedPosting.getId()).isNotZero();
        assertThat(persistedPosting.getDate()).isEqualTo(organizationPosting.getDate());
        assertThat(persistedPosting.getType()).isEqualTo(organizationPosting.getType());
        assertThat(persistedPosting.getPurpose()).isEqualTo(organizationPosting.getPurpose());
        assertThat(((OrganizationPosting) persistedPosting).getOrganization().getId()).isEqualTo(1L);
    }

    @Test
    public void addOrganizationPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.addOrganizationPosting(4,
                        new OrganizationPosting()));
    }

    @Test
    public void editOrganizationPostingShouldThrowException() {
        OrganizationPosting organizationPosting = new OrganizationPosting(
                PostingType.CREDIT, 1000L, "2025-09-11", "Test_updated", null
        );
        Posting updatedPosting = budgetAccountService.editOrganizationPosting(1, 2, organizationPosting);
        assertThat(updatedPosting.getId()).isEqualTo(2);
        assertThat(updatedPosting.getDate()).isEqualTo(organizationPosting.getDate());
        assertThat(updatedPosting.getType()).isEqualTo(organizationPosting.getType());
        assertThat(updatedPosting.getPurpose()).isEqualTo(organizationPosting.getPurpose());
        assertThat(updatedPosting.getAmountInCents()).isEqualTo(organizationPosting.getAmountInCents());
        assertThat(((OrganizationPosting) updatedPosting).getOrganization().getId()).isEqualTo(1L);
    }

    @Test
    public void editOrganizationPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.editOrganizationPosting(4, 1,
                        new OrganizationPosting()));
    }

    @Test
    public void editOrganizationPostingForNonExistingPostingShouldThrowException() {
        assertThatExceptionOfType(PostingDoesNotExistException.class)
                .isThrownBy(() -> budgetAccountService.editOrganizationPosting(1, 1,
                        new OrganizationPosting()));
    }

    @Test
    @Transactional
    public void deleteOrganizationPostingShouldThrowException() {
        budgetAccountService.deleteOrganizationPosting(1, 2);
        Optional<Organization> orga = organizationRepository.findById(1L);
        assertThat(orga).isPresent();
        assertThat(orga.get().getOrganizationPostings().size()).isEqualTo(0);
    }

    @Test
    public void deleteOrganizationPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.deleteOrganizationPosting(4, 1));
    }

    @Test
    public void deleteOrganizationPostingForNonExistingPostingShouldThrowException() {
        assertThatExceptionOfType(PostingDoesNotExistException.class)
                .isThrownBy(() -> budgetAccountService.deleteOrganizationPosting(1, 1));
    }

    @Test
    public void addActivityPostingShouldCreateActivityPosting() {
        ActivityPosting activityPosting = new ActivityPosting(PostingType.CREDIT, 10000L, "2025-09-11",
                "test",
                null);
        Posting persistedActivityPosting = budgetAccountService
                .addActivityPosting(1, 1, activityPosting);
        assertThat(persistedActivityPosting.getId()).isNotZero();
        assertThat(persistedActivityPosting.getDate()).isEqualTo(activityPosting.getDate());
        assertThat(persistedActivityPosting.getType()).isEqualTo(activityPosting.getType());
        assertThat(persistedActivityPosting.getPurpose()).isEqualTo(activityPosting.getPurpose());
        assertThat(((ActivityPosting) persistedActivityPosting).getActivity().getId()).isEqualTo(1L);
    }

    @Test
    public void addActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.addActivityPosting(4, 1,
                        new ActivityPosting()));
    }

    @Test
    public void addActivityPostingForNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.addActivityPosting(1, 2,
                        new ActivityPosting()));
    }

    @Test
    public void editActivityPostingShouldEditActivityPosting() {
        ActivityPosting activityPosting = new ActivityPosting(PostingType.CREDIT, 10000L, "2025-09-11",
                "test_bearbeitet",
                null);
        Posting editedActivityPosting = budgetAccountService
                .editActivityPosting(1, 1, 1, activityPosting);
        assertThat(editedActivityPosting.getId()).isEqualTo(1);
        assertThat(editedActivityPosting.getDate()).isEqualTo(activityPosting.getDate());
        assertThat(editedActivityPosting.getType()).isEqualTo(activityPosting.getType());
        assertThat(editedActivityPosting.getPurpose()).isEqualTo(activityPosting.getPurpose());
        assertThat(((ActivityPosting) editedActivityPosting).getActivity().getId()).isEqualTo(1L);
    }

    @Test
    public void editActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(4, 1, 1,
                        new ActivityPosting()));
    }

    @Test
    public void editActivityPostingForNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(1, 3, 1,
                        new ActivityPosting()));
    }

    @Test
    public void editActivityPostingForNonExistingPostingShouldThrowException() {
        assertThatExceptionOfType(PostingDoesNotExistException.class)
                .isThrownBy(() -> budgetAccountService.editActivityPosting(1, 1, 2,
                        new ActivityPosting()));
    }

    @Test
    @Transactional
    public void deleteActivityPostingShouldDeleteActivityPosting() {
        budgetAccountService.deleteActivityPosting(1, 1, 1);
        Optional<Organization> orga = organizationRepository.findById(1L);
        assertThat(orga).isPresent();
        Optional<Activity> activity = orga.get().getActivities().stream().filter(a -> a.getId() == 1L).findFirst();
        assertThat(activity).isPresent();
        assertThat(activity.get().getActivityPostings().size()).isEqualTo(0);
    }

    @Test
    public void deleteActivityPostingForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> budgetAccountService.deleteActivityPosting(4, 1, 1));
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
