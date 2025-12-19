package org.kollapp.user.adapters.primary.rest;

import jakarta.validation.Valid;

import lombok.extern.slf4j.Slf4j;

import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.kollapp.core.adapters.primary.rest.dto.MessageResponseTO;
import org.kollapp.user.adapters.primary.rest.dto.ForgotPasswordRequestTO;
import org.kollapp.user.adapters.primary.rest.dto.KollappUserSignupRequestTO;
import org.kollapp.user.adapters.primary.rest.dto.ResendConfirmationRequestTO;
import org.kollapp.user.adapters.primary.rest.dto.ResetPasswordRequestTO;
import org.kollapp.user.application.service.KollappUserService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/public/user")
@Slf4j
@PrimaryAdapter
public class UnauthorizedKollappUserController {

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private KollappUserService kollappUserService;

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public ResponseEntity<MessageResponseTO> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestTO forgotPasswordTo) {
        kollappUserService.forgotPassword(forgotPasswordTo.getEmail());
        return ResponseEntity.ok(new MessageResponseTO("success.email.reset-password", messageSource));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token")
    public ResponseEntity<MessageResponseTO> resetPassword(
            @RequestParam("token") String token, @Valid @RequestBody ResetPasswordRequestTO resetPasswordTo) {
        kollappUserService.resetPassword(token, resetPasswordTo.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.password.reset", messageSource));
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new kollapp user")
    public ResponseEntity<MessageResponseTO> registerKollappUser(
            @Valid @RequestBody KollappUserSignupRequestTO signUpRequest) {
        kollappUserService.register(signUpRequest.getUsername(), signUpRequest.getEmail(), signUpRequest.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.registration", messageSource));
    }

    @PostMapping("/resend-confirmation")
    @Operation(summary = "Resend the confirmation email")
    public ResponseEntity<MessageResponseTO> resendConfirmation(
            @Valid @RequestBody ResendConfirmationRequestTO resendConfirmationTo) {
        kollappUserService.resendConfirmationMail(resendConfirmationTo.getEmail());
        return ResponseEntity.ok(new MessageResponseTO("success.email.confirmation-resent", messageSource));
    }
}
