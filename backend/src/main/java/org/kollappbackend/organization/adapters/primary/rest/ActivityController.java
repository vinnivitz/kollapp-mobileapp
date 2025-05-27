package org.kollappbackend.organization.adapters.primary.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.organization.adapters.primary.rest.mapper.ActivityMapper;
import org.kollappbackend.organization.adapters.primary.rest.model.ActivityCreationRequestTO;
import org.kollappbackend.organization.adapters.primary.rest.model.ActivityTO;
import org.kollappbackend.organization.adapters.primary.rest.model.ActivityUpdateRequestTO;
import org.kollappbackend.organization.application.model.Activity;
import org.kollappbackend.organization.application.service.ActivityService;
import org.kollappbackend.user.application.model.RequiresManagerRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PrimaryAdapter
@RequestMapping("/api/organization")
@AllArgsConstructor
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ActivityMapper activityMapper;

    @Autowired
    private MessageSource messageSource;

    @PostMapping("/{organization-id}/activity")
    @Operation(summary = "Create new activity for organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> createNewActivity(@PathVariable("organization-id") long organizationId,
                                                        @RequestBody
                                                        ActivityCreationRequestTO activityCreationRequestTO) {
        Activity activity = activityMapper.activityCreationRequestTOToActivity(activityCreationRequestTO);
        Activity persistedActivity = activityService.createActivityForOrganization(organizationId, activity);
        ActivityTO activityTO = activityMapper.activityToActivityTO(persistedActivity);
        return ResponseEntity.ok(new DataResponseTO(activityTO, "success.activity.create", messageSource));
    }

    @PostMapping("/{organization-id}/activity/{activity-id}")
    @Operation(summary = "Update activity of organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<ResponseTO> updateActivityOfOrganization(@PathVariable("organization-id") long organizationId,
                                                                   @PathVariable("activity-id") long activityId,
                                                                   @RequestBody
                                                                   ActivityUpdateRequestTO activityUpdateRequestTO) {
        Activity activityToBeUpdated = activityMapper.activityUpdateTOToActivity(activityUpdateRequestTO);
        Activity updatedActivity = activityService.updateActivity(organizationId, activityId, activityToBeUpdated);
        ActivityTO activityTO = activityMapper.activityToActivityTO(updatedActivity);
        return ResponseEntity.ok(new DataResponseTO(activityTO, "success.activity.update", messageSource));
    }

    @DeleteMapping("/{organization-id}/activity/{activity-id}")
    @Operation(summary = "Delete activity of organization", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerRole
    public ResponseEntity<MessageResponseTO> deleteActivityOfOrganization(
            @PathVariable("organization-id") long organizationId, @PathVariable("activity-id") long activityId) {
        activityService.deleteActivity(organizationId, activityId);
        return ResponseEntity.ok(new MessageResponseTO("success.activity.delete", messageSource));
    }

}
