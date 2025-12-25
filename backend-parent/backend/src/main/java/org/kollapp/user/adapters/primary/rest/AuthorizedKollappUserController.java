package org.kollapp.user.adapters.primary.rest;

import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.MessageUtil;
import org.kollapp.core.adapters.primary.rest.dto.DataResponseTO;
import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.user.adapters.primary.rest.dto.DeleteAccountRequestTO;
import org.kollapp.user.adapters.primary.rest.dto.KollappUserTO;
import org.kollapp.user.adapters.primary.rest.dto.KollappUserUpdateRequestTO;
import org.kollapp.user.adapters.primary.rest.dto.PasswordChangeRequestTO;
import org.kollapp.user.adapters.primary.rest.mapper.KollappUserMapper;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.service.KollappUserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/user")
@Slf4j
@PrimaryAdapter
public class AuthorizedKollappUserController {
    @Autowired
    private MessageUtil messageUtil;

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private KollappUserMapper kollappUserMapper;

    @GetMapping
    @Operation(
            summary = "Get the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<KollappUserTO>> getKollappUser() {
        KollappUser kollappUser = kollappUserService.getLoggedInKollappUser();
        KollappUserTO kollappUserTO = kollappUserMapper.kollappUserToKollappUserTO(kollappUser);
        String message = messageUtil.getMessage("success.user.get-data");
        return ResponseEntity.ok(new DataResponseTO<>(kollappUserTO, message));
    }

    @PatchMapping("/change-password")
    @Operation(
            summary = "Change the password of the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo) {
        kollappUserService.changePassword(changeRequestTo.getCurrentPassword(), changeRequestTo.getNewPassword());
        String message = messageUtil.getMessage("success.password.changed");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }

    @PatchMapping("/update-information")
    @Operation(
            summary = "Change user base information of the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<DataResponseTO<KollappUserTO>> updateUser(
            @Valid @RequestBody KollappUserUpdateRequestTO updateRequestTO) {
        KollappUser updatedUser =
                kollappUserService.updateKollappUser(updateRequestTO.getUsername(), updateRequestTO.getEmail());
        KollappUserTO updatedUserTO = kollappUserMapper.kollappUserToKollappUserTO(updatedUser);
        String message;
        if (updateRequestTO.getEmail() != null && !updateRequestTO.getEmail().equals(updatedUser.getEmail())) {
            message = messageUtil.getMessage("success.email.change-requested");
        } else {
            message = messageUtil.getMessage("success.user.update-data");
        }
        return ResponseEntity.ok(new DataResponseTO<>(updatedUserTO, message));
    }

    @DeleteMapping
    @Operation(
            summary = "Delete the logged in user",
            security = {@SecurityRequirement(name = "bearer-key")})
    public ResponseEntity<MessageResponseTO> deleteUser(
            @Valid @RequestBody DeleteAccountRequestTO deleteAccountRequestTO) {
        kollappUserService.deleteKollappUser(deleteAccountRequestTO.getPassword());
        String message = messageUtil.getMessage("success.user.delete");
        return ResponseEntity.ok(new MessageResponseTO(message));
    }
}
