package org.kollappbackend.core.organization;

import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.model.Activity;
import org.kollappbackend.organization.application.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

@Sql(scripts = "/sql/organization/base_data_organization_kollapp_user.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
@Sql(scripts = "/sql/clear.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_CLASS)
@WithMockUser(username = "nina", authorities = { "ROLE_KOLLAPP_USER" })
public class ActivityServiceKollappUserIT extends BaseIT {

    @Autowired
    private ActivityService activityService;

    @Test
    public void getActivitiesOfOrganizationShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> activityService.getActivitiesOfOrganization(1));
    }

    @Test
    public void createActivityShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> activityService.createActivityForOrganization(0, new Activity()));
    }

    @Test
    public void updateActivityShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> activityService.updateActivity(1, 1, new Activity()));
    }

    @Test
    public void deleteActivityShouldThrowException() {
        assertThatExceptionOfType(AuthorizationDeniedException.class)
                .isThrownBy(() -> activityService.deleteActivity(1, 1));
    }
}
