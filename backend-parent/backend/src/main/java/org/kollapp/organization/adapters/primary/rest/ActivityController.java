package org.kollapp.organization.adapters.primary.rest;

import jakarta.validation.Valid;

import lombok.AllArgsConstructor;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityCreationRequestTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityTO;
import org.kollapp.organization.adapters.primary.rest.dto.ActivityUpdateRequestTO;
import org.kollapp.organization.adapters.primary.rest.mapper.ActivityMapper;
import org.kollapp.organization.application.model.Activity;
import org.kollapp.organization.application.service.ActivityService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

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
    private MessageUtil messageUtil;

    @PostMapping("/{organization-id}/activity")
    @Operation(
            summary = "Create new activity for organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<ActivityTO>> createNewActivity(
            @PathVariable("organization-id") long organizationId,
            @Valid @RequestBody ActivityCreationRequestTO activityCreationRequestTO) {
        Activity activity = activityMapper.activityCreationRequestTOToActivity(activityCreationRequestTO);
        Activity persistedActivity = activityService.createActivityForOrganization(organizationId, activity);
        ActivityTO activityTO = activityMapper.activityToActivityTO(persistedActivity);
        String message = messageUtil.getMessage("success.activity.create");
        return ResponseEntity.ok(new DataResponseTO<>(activityTO, message));
    }

    @PutMapping("/{organization-id}/activity/{activity-id}")
    @Operation(
            summary = "Update activity of organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<ActivityTO>> updateActivityOfOrganization(
            @PathVariable("organization-id") long organizationId,
            @PathVariable("activity-id") long activityId,
            @Valid @RequestBody ActivityUpdateRequestTO activityUpdateRequestTO) {
        Activity activityToBeUpdated = activityMapper.activityUpdateTOToActivity(activityUpdateRequestTO);
        Activity updatedActivity = activityService.updateActivity(organizationId, activityId, activityToBeUpdated);
        ActivityTO activityTO = activityMapper.activityToActivityTO(updatedActivity);
        String message = messageUtil.getMessage("success.activity.update");
        return ResponseEntity.ok(new DataResponseTO<>(activityTO, message));
    }

    @DeleteMapping("/{organization-id}/activity/{activity-id}")
    @Operation(
            summary = "Delete activity of organization",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteActivityOfOrganization(
            @PathVariable("organization-id") long organizationId, @PathVariable("activity-id") long activityId) {
        activityService.deleteActivity(organizationId, activityId);
        String message = messageUtil.getMessage("success.activity.delete");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }
}
