package org.kollapp.organization.adapters.primary.rest;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.core.validation.ValidId;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.mapper.ActivityMapper;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.AllArgsConstructor;

@RestController
@PrimaryAdapter
@RequestMapping("/api/organization")
@AllArgsConstructor
@Validated
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ActivityMapper activityMapper;

    @Autowired
    private MessageSource messageSource;

    @PostMapping("/{organization-id}/activity")
    @Operation(
            summary = "Create new activity for organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<ActivityTO>> createNewActivity(
            @PathVariable("organization-id") @ValidId long organizationId,
            @RequestBody ActivityCreationRequestTO activityCreationRequestTO) {
        Activity activity = activityMapper.activityCreationRequestTOToActivity(activityCreationRequestTO);
        Activity persistedActivity = activityService.createActivityForOrganization(organizationId, activity);
        ActivityTO activityTO = activityMapper.activityToActivityTO(persistedActivity);
        return ResponseEntity.ok(new DataResponseTO<>(activityTO, "success.activity.create", messageSource));
    }

    @PostMapping("/{organization-id}/activity/{activity-id}")
    @Operation(
            summary = "Update activity of organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<ActivityTO>> updateActivityOfOrganization(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("activity-id") @ValidId long activityId,
            @RequestBody ActivityUpdateRequestTO activityUpdateRequestTO) {
        Activity activityToBeUpdated = activityMapper.activityUpdateTOToActivity(activityUpdateRequestTO);
        Activity updatedActivity = activityService.updateActivity(organizationId, activityId, activityToBeUpdated);
        ActivityTO activityTO = activityMapper.activityToActivityTO(updatedActivity);
        return ResponseEntity.ok(new DataResponseTO<>(activityTO, "success.activity.update", messageSource));
    }

    @DeleteMapping("/{organization-id}/activity/{activity-id}")
    @Operation(
            summary = "Delete activity of organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteActivityOfOrganization(
            @PathVariable("organization-id") @ValidId long organizationId,
            @PathVariable("activity-id") @ValidId long activityId) {
        activityService.deleteActivity(organizationId, activityId);
        return ResponseEntity.ok(new MessageResponseTO("success.activity.delete", messageSource));
    }
}
