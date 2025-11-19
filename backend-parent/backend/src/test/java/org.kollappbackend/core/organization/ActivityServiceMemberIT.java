package org.kollappbackend.core.organization;

import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.exception.OrganizationAuthorizationException;
import org.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import org.kollappbackend.organization.application.exception.PersonNotRegisteredInOrganizationException;
import org.kollappbackend.organization.application.model.Activity;
import org.kollappbackend.organization.application.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

@Sql(scripts = "/sql/organization/base_data_organization_kollapp_orga_member_approved.sql",
        executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/sql/clear.sql",
        executionPhase = AFTER_TEST_METHOD)
@WithMockUser(username = "nina", authorities = { "ROLE_KOLLAPP_ORGANIZATION_MEMBER" })
public class ActivityServiceMemberIT extends BaseIT {

    @Autowired
    private ActivityService activityService;

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
    public void getActivitiesOfWrongOrganizationShouldThrowException() {
        assertThatExceptionOfType(PersonNotRegisteredInOrganizationException.class)
                .isThrownBy(() -> activityService.getActivitiesOfOrganization(2));
    }

    @Test
    public void getActivitiesOfNonExistingOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationNotFoundException.class)
                .isThrownBy(() -> activityService.getActivitiesOfOrganization(3));
    }

    @Test
    @Transactional
    public void createActivityForOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> activityService.createActivityForOrganization(1, new Activity()));
    }

    @Test
    @Transactional
    public void updateActivityForOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> activityService.updateActivity(1, 1, new Activity()));
    }

    @Test
    @Transactional
    public void deleteActivityForOrganizationShouldThrowException() {
        assertThatExceptionOfType(OrganizationAuthorizationException.class)
                .isThrownBy(() -> activityService.deleteActivity(1, 1));
    }

}
