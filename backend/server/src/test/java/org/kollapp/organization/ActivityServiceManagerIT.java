package org.kollapp.organization;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

import org.kollapp.core.BaseIT;
import org.kollapp.organization.application.exception.ActivityNotFoundException;
import org.kollapp.organization.application.exception.OrganizationNotFoundException;
import org.kollapp.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.model.Organization;
import org.kollapp.organization.application.repository.OrganizationRepository;
import org.kollapp.organization.application.service.ActivityService;

@Sql(
        scripts = "/sql/organization/base_data_organization_kollapp_orga_manager.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@WithMockUser(
        username = "nina",
        authorities = {"ROLE_KOLLAPP_ORGANIZATION_MEMBER"})
public class ActivityServiceManagerIT extends BaseIT {

    @Autowired private ActivityService activityService;
    @Autowired private OrganizationRepository organizationRepository;

    @Test
    public void getActivitiesOfOrganizationShouldReturnActivities() {
        List<Activity> activities = activityService.getActivitiesOfOrganization(1);
        assertThat(activities).hasSize(1);
        assertThat(activities.getFirst().getId()).isEqualTo(1L);
        assertThat(activities.getFirst().getName()).isEqualTo("Halloween-Party");
        assertThat(activities.getFirst().getLocation()).isEqualTo("Soderso");
        assertThat(activities.getFirst().getOrganization().getId()).isEqualTo(1L);
    }

    @Test
    @Transactional
    public void createActivityForOrganizationShouldReturnActivity() {
        Activity activityToBeCreated =
                Activity.builder().name("Weihnachtsmarkt").location("Kukulida").build();
        Activity activity = activityService.createActivityForOrganization(1, activityToBeCreated);
        assertThat(activity.getId()).isNotZero();
        assertThat(activity.getName()).isEqualTo("Weihnachtsmarkt");
        assertThat(activity.getLocation()).isEqualTo("Kukulida");
        Optional<Organization> organizationOpt = organizationRepository.findById(1);
        assertThat(organizationOpt).isPresent();
        Organization organization = organizationOpt.get();
        assertThat(organization.getActivities()).hasSize(2);
    }

    @Test
    public void createActivityForWrongOrganizationShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> activityService.createActivityForOrganization(2, new Activity()));
    }

    @Test
    public void createActivityForNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> activityService.createActivityForOrganization(4, new Activity()));
    }

    @Test
    public void updateActivityForOrganizationShouldUpdateActivity() {
        Activity activityToBeUpdated =
                Activity.builder().location("Kashay").name("Halloween-Party").build();
        Activity activity = activityService.updateActivity(1, 1, activityToBeUpdated);
        assertThat(activity.getId()).isEqualTo(1);
        assertThat(activity.getName()).isEqualTo(activityToBeUpdated.getName());
        assertThat(activity.getLocation()).isEqualTo(activityToBeUpdated.getLocation());
    }

    @Test
    public void updateActivityThatExistsOnlyInNonAuthorizedOrganizationShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> activityService.updateActivity(2, 2, new Activity()));
    }

    @Test
    public void updateNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> activityService.updateActivity(1, 3, new Activity()));
    }

    @Test
    public void updateNonAuthorizedActivityWithAuthorizedOrganizationShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> activityService.updateActivity(1, 2, new Activity()));
    }

    @Test
    @Transactional
    public void deleteActivityForOrganizationShouldDeleteActivity() {
        activityService.deleteActivity(1, 1);
        Optional<Organization> organizationOpt = organizationRepository.findById(1);
        assertThat(organizationOpt).isPresent();
        assertThat(organizationOpt.get().getActivities()).hasSize(0);
    }

    @Test
    public void deleteActivityThatExistsOnlyInNonAuthorizedOrganizationShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> activityService.deleteActivity(2, 2));
    }

    @Test
    public void deleteNonExistingActivityShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> activityService.deleteActivity(1, 3));
    }

    @Test
    public void deleteNonAuthorizedActivityWithAuthorizedOrganizationShouldThrowException() {
        assertThatExceptionOfType(ActivityNotFoundException.class)
                .isThrownBy(() -> activityService.deleteActivity(1, 2));
    }
}
