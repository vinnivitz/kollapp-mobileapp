package org.kollappbackend.user.adapters.rest;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.kollappbackend.core.adapters.primary.rest.model.MessageResponseTO;
import org.kollappbackend.core.adapters.primary.rest.model.ResponseTO;
import org.kollappbackend.user.adapters.rest.model.ForgotPasswordRequestTO;
import org.kollappbackend.user.adapters.rest.model.KollappUserSignupRequest;
import org.kollappbackend.user.adapters.rest.model.ResetPasswordRequestTO;
import org.kollappbackend.user.application.model.ERole;
import org.kollappbackend.user.application.service.KollappUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/user")
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

    @PostMapping("/manager-signup")
    public ResponseEntity<ResponseTO> registerKollappManager(
            @Valid @RequestBody KollappUserSignupRequest signUpRequest) {
        kollappUserService.register(signUpRequest.getUsername(), signUpRequest.getEmail(), signUpRequest.getPassword(),
                signUpRequest.getName(), signUpRequest.getSurname(), List.of(ERole.ROLE_MANAGER));
        return ResponseEntity.ok(new MessageResponseTO("success.registration", messageSource));
    }

    @PostMapping("/member-signup")
    public ResponseEntity<ResponseTO> registerKollappMember(
            @Valid @RequestBody KollappUserSignupRequest signUpRequest) {
        kollappUserService.register(signUpRequest.getUsername(), signUpRequest.getEmail(), signUpRequest.getPassword(),
                signUpRequest.getName(), signUpRequest.getSurname(), List.of(ERole.ROLE_MEMBER));
        return ResponseEntity.ok(new MessageResponseTO("success.registration", messageSource));
    }
}
