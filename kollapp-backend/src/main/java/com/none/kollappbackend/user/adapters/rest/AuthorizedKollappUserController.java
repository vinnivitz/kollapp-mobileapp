package com.none.kollappbackend.user.adapters.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.DataResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.user.adapters.rest.mapper.KollappUserMapper;
import com.none.kollappbackend.user.adapters.rest.model.KollappUserTO;
import com.none.kollappbackend.user.adapters.rest.model.PasswordChangeRequestTO;
import com.none.kollappbackend.user.application.model.KollappUser;
import com.none.kollappbackend.user.application.model.KollappUserDetails;
import com.none.kollappbackend.user.application.service.KollappUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@Transactional
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
    @Operation(summary = "Get the logged-in kollapp user", security = { @SecurityRequirement(name = "bearer-key") })
    @PreAuthorize("hasRole('MANAGER') or hasRole('MEMBER')")
    public ResponseEntity<ResponseTO> getKollappUser() {
        KollappUser kollappUser = kollappUserService.getLoggedInKollappUser();
        KollappUserTO kollappUserTO = kollappUserMapper.userToUserTO(kollappUser);
        return ResponseEntity.ok(new DataResponseTO(kollappUserTO, "success.organization.get-data", messageSource));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change the password", security = { @SecurityRequirement(name = "bearer-key") })
    @PreAuthorize("hasRole('MANAGER') or hasRole('MEMBER')")
    public ResponseEntity<ResponseTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo) {
        kollappUserService.changePassword(changeRequestTo.getCurrentPassword(), changeRequestTo.getNewPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.password.changed", messageSource));
    }
}
