package com.none.orgaappbackend.organization.adapters.primary.rest;

import com.none.orgaappbackend.organization.util.JwtUtil;
import com.none.orgaappbackend.organization.adapters.primary.rest.model.*;
import com.none.orgaappbackend.organization.application.AuthService;
import com.none.orgaappbackend.organization.application.OrganizationRepository;
import com.none.orgaappbackend.organization.adapters.primary.rest.model.LoginResponse;
import com.none.orgaappbackend.organization.application.OrganizationService;
import com.none.orgaappbackend.organization.application.model.Organization;
import com.none.orgaappbackend.organization.application.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Transactional
@Slf4j
public class AuthController {

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateOrganization(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/confirmation")
    public ResponseEntity<String> confirmOrganization(@RequestParam ("confirmationToken") String confirmationToken){
        organizationService.activateOrganization(confirmationToken);
        return ResponseEntity.ok("<p>Die E-Mail-Adresse wurde erfolgreich bestätigt.</p>");
    }

    @PostMapping("/change-password")
    @Operation(summary = "Das Passwort ändern", security = { @SecurityRequirement(name = "bearer-key") })
    public ResponseEntity<MessageTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo){
        organizationService.changePassword(changeRequestTo.getOldPassword(), changeRequestTo.getNewPassword());
        return ResponseEntity.status(HttpStatus.OK).body(new MessageTO("Das Passwort wurde erfolgreich geändert."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageTO> forgotPassword(@RequestBody ForgotPasswordRequestTO forgotPasswordTo){
        organizationService.resetPassword(forgotPasswordTo.getEmail());
        return ResponseEntity.status(HttpStatus.OK).body(new MessageTO("Wenn deine E-Mail-Adresse dem System bekannt ist, erhältst du in Kürze eine Mail mit einem temporären Passwort. Bitte ändere es, nachdem du dich das erste Mal damit eingeloggt hast. Vergiss nicht, ggf. auch im Spam-Ordner nachzuschauen."));
    }
}
