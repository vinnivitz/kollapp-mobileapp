package com.none.kollappbackend.organization.adapters.primary.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.organization.adapters.primary.rest.mapper.ActivityMapper;
import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityCreationRequestTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityTO;
import com.none.kollappbackend.organization.adapters.primary.rest.model.ActivityUpdateRequestTO;
import com.none.kollappbackend.organization.application.model.Activity;
import com.none.kollappbackend.organization.application.service.ActivityService;
import com.none.kollappbackend.user.application.model.RequiresManagerOrMemberRole;
import com.none.kollappbackend.user.application.model.RequiresManagerRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PrimaryAdapter
@RequestMapping("/api/organization")
@AllArgsConstructor
public class ActivityController {

    private ActivityService activityService;
    private ActivityMapper activityMapper;
    private MessageSource messageSource;

    @GetMapping("/{organization-id}/activities")
    @Operation(summary = "Get the activities of an organization", security = {
            @SecurityRequirement(name = "bearer-key") })
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> getActivitiesOfOrganization(@PathVariable("organization-id") long organizationId) {
        List<Activity> activities = activityService.getActivitiesOfOrganization(organizationId);
        List<ActivityTO> activityTOs = activities.stream().map(a -> activityMapper.activityToActivityTO(a)).toList();
        return ResponseEntity.ok(new DataResponseTO(activityTOs, "success.organization.get", messageSource));
    }

    @PostMapping("/{organization-id}/activity")
    @Operation(summary = "Create new activity for organization", security = {
            @SecurityRequirement(name = "bearer-key") })
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> createNewActivity(@PathVariable("organizationId") long organizationId,
                                                        @RequestBody ActivityCreationRequestTO activityCreationRequestTO ) {
        Activity activity = activityMapper.activityCreationRequestTOToActivity(activityCreationRequestTO);
        ActivityTO activityTO = activityMapper.activityToActivityTO(activity);
        return ResponseEntity.ok(new DataResponseTO(activityTO, "success.organization.create", messageSource));
    }

    @PostMapping("/{organization-id}/activity/{activity-id}")
    @Operation(summary = "Update activity of organization", security = {
            @SecurityRequirement(name = "bearer-key") })
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> updateActivityOfOrganization(@PathVariable("organization-id") long organizationId,
                                                                   @PathVariable("activity-id") long activityId,
                                                                   @RequestBody ActivityUpdateRequestTO activityUpdateRequestTO) {
        Activity activityToBeUpdated = activityMapper.activityUpdateTOToActivity(activityUpdateRequestTO);
        Activity updatedActivity = activityService.updateActivity(organizationId, activityId, activityToBeUpdated);
        ActivityTO activityTO = activityMapper.activityToActivityTO(updatedActivity);
        return ResponseEntity.ok(new DataResponseTO(activityTO, "success.organization.update", messageSource));
    }
}
