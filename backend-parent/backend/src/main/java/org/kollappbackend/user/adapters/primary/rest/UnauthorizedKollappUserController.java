package org.kollappbackend.user.adapters.primary.rest;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.user.adapters.primary.rest.model.ForgotPasswordRequestTO;
import org.kollappbackend.user.adapters.primary.rest.model.KollappUserSignupRequest;
import org.kollappbackend.user.adapters.primary.rest.model.ResendConfirmationRequestTO;
import org.kollappbackend.user.adapters.primary.rest.model.ResetPasswordRequestTO;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<ResponseTO> registerKollappUser(
            @Valid @RequestBody KollappUserSignupRequest signUpRequest) {
        kollappUserService.register(signUpRequest.getUsername(), signUpRequest.getEmail(), signUpRequest.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("success.registration", messageSource));
    }

    @PostMapping("/resend-confirmation")
    public ResponseEntity<MessageResponseTO> resendConfirmation(@Valid @RequestBody ResendConfirmationRequestTO resendConfirmationTo) {
        kollappUserService.resendConfirmationMail(resendConfirmationTo.getEmail());
        return ResponseEntity.ok(new MessageResponseTO("success.email.confirmation-resent", messageSource));
    }
}