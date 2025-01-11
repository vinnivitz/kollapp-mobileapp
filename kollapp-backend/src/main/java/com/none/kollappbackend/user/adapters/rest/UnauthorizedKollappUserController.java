package com.none.kollappbackend.user.adapters.rest;

import com.none.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import com.none.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import com.none.kollappbackend.user.adapters.rest.model.*;
import com.none.kollappbackend.user.application.service.KollappUserService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/user")
@Transactional
@Slf4j
@PrimaryAdapter
public class UnauthorizedKollappUserController {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private KollappUserService kollappUserService;

    @GetMapping("/confirmation")
    public ResponseEntity<ResponseTO> confirmKollappUser(@RequestParam("confirmationToken") String confirmationToken) {
        kollappUserService.activateKollappUser(confirmationToken);
        return ResponseEntity.ok(new MessageResponseTO("success.confirmation", messageSource));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequestTO forgotPasswordTo) {
        kollappUserService.forgotPassword(forgotPasswordTo.getEmail());
        return ResponseEntity.ok(new MessageResponseTO("success.email.reset-password", messageSource));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResponseTO> resetPassword(@RequestParam("token") String token,
            @Valid @RequestBody ResetPasswordRequestTO resetPasswordTo) {
        kollappUserService.resetPassword(token, resetPasswordTo.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.password.reset", messageSource));
    }

    @PostMapping("/signup")
    public ResponseEntity<ResponseTO> registerOrganization(
            @Valid @RequestBody KollappUserSignupRequest signUpRequest) {
        kollappUserService.register(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                signUpRequest.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.registration", messageSource));
    }
}
