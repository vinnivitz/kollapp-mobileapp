package org.kollappbackend.user.adapters.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.user.adapters.rest.mapper.KollappUserMapper;
import org.kollappbackend.user.adapters.rest.model.KollappUserTO;
import org.kollappbackend.user.adapters.rest.model.KollappUserUpdateRequestTO;
import org.kollappbackend.user.adapters.rest.model.PasswordChangeRequestTO;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.model.RequiresManagerOrMemberRole;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@Slf4j
@PrimaryAdapter
public class AuthorizedKollappUserController {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private KollappUserService kollappUserService;

    @Autowired
    private KollappUserMapper kollappUserMapper;

    @GetMapping
    @Operation(summary = "Get the logged in user", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> getKollappUser() {
        KollappUser kollappUser = kollappUserService.getLoggedInKollappUser();
        KollappUserTO kollappUserTO = kollappUserMapper.userToUserTO(kollappUser);
        return ResponseEntity.ok(new DataResponseTO(kollappUserTO, "success.user.get-data", messageSource));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change the password of the logged in user", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo) {
        kollappUserService.changePassword(changeRequestTo.getCurrentPassword(), changeRequestTo.getNewPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.password.changed", messageSource));
    }

    @PostMapping("/update-information")
    @Operation(summary = "Change user base information of the logged in user", security = {
            @SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> updateUser(@Valid @RequestBody KollappUserUpdateRequestTO updateRequestTO) {
        KollappUser updatedUser =
                kollappUserService.updateKollappUser(updateRequestTO.getUsername(), updateRequestTO.getEmail(),
                        updateRequestTO.getSurname(), updateRequestTO.getName());
        KollappUserTO updatedUserTO = kollappUserMapper.userToUserTO(updatedUser);
        return ResponseEntity.ok(new DataResponseTO(updatedUserTO, "success.user.update-data", messageSource));
    }

    @DeleteMapping("/delete")
    @Operation(summary = "Delete the logged in user", security = {@SecurityRequirement(name = "bearer-key")})
    @RequiresManagerOrMemberRole
    public ResponseEntity<ResponseTO> deleteUser() {
        kollappUserService.deleteKollappUser();
        return ResponseEntity.ok(new MessageResponseTO("success.user.delete", messageSource));
    }
}
