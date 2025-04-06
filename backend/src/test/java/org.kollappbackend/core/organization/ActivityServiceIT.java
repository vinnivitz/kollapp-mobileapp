package org.kollappbackend.core.organization;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.kollappbackend.core.core.BaseIT;
import org.kollappbackend.organization.application.exception.ActivityNotFoundException;
import org.kollappbackend.organization.application.model.Activity;
import org.kollappbackend.organization.application.repository.OrganizationRepository;
import org.kollappbackend.organization.application.service.ActivityService;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.springframework.test.context.jdbc.Sql.ExecutionPhase.AFTER_TEST_METHOD;

@Sql(scripts = "/sql/clear.sql", executionPhase = AFTER_TEST_METHOD)
@Transactional
public class ActivityServiceIT extends BaseIT {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private OrganizationRepository organizationRepository;

    @MockBean
    private KollappUserService kollappUserService;

    @BeforeEach
    public void beforeEach() {
        KollappUser mockUser = KollappUser.builder().id(1L).username("Erika").build();
        when(kollappUserService.getLoggedInKollappUser()).thenReturn(mockUser);
    }

    @Test
    @Sql("/sql/organization/organization_with_manager_and_activities.sql")
    public void getActivitiesOfOrganization() {
        List<Activity> activities = activityService.getActivitiesOfOrganization(1);
        assertThat(activities.size()).isEqualTo(2);
    }

    @Test
    @Sql("/sql/organization/organization_with_single_manager.sql")
    public void createActivityForOrganization() {
        Activity activity = Activity.builder().name("Halloween").location("Kashay-Salon").build();
        activityService.createActivityForOrganization(1, activity);
        List<Activity> activities = organizationRepository.findById(1).get().getActivities();
        assertThat(activities.size()).isEqualTo(1);
        assertThat(activities.getFirst().getName()).isEqualTo("Halloween");
    }

    @Test
    @Sql("/sql/organization/organization_with_manager_and_activities.sql")
    public void updateActivitySuccess() {
        Activity updatedActivity = Activity.builder().name("Halloween-updated").location("Kashay-Salon").id(1).build();
        activityService.updateActivity(1, 1, updatedActivity);
        List<Activity> activities = organizationRepository.findById(1).get().getActivities();
        assertThat(activities.stream().filter(a -> a.getId() == 1).findFirst().get().getName()).isEqualTo(
                "Halloween-updated");
    }

    @Test
    @Sql("/sql/organization/organization_with_manager_and_activities.sql")
    public void updateActivityFailure() {
        Activity updatedActivity = Activity.builder().name("Halloween-updated").location("Kashay-Salon").id(3).build();
        assertThrows(ActivityNotFoundException.class, () -> activityService.updateActivity(1, 3, updatedActivity));
    }

    @Test
    @Sql("/sql/organization/organization_with_manager_and_activities.sql")
    public void deleteActivity() {
        activityService.deleteActivity(1, 1);
        List<Activity> activities = organizationRepository.findById(1).get().getActivities();
        assertThat(activities.size()).isEqualTo(1);
        assertThat(activities.getFirst().getName()).isEqualTo("Silvester");
    }
}
