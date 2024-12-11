package com.none.orgaappbackend.organization.adapters.primary.rest;

import com.none.orgaappbackend.core.adapters.primary.model.MessageResponseTO;
import com.none.orgaappbackend.core.adapters.primary.model.ResponseTO;
import com.none.orgaappbackend.organization.adapters.primary.rest.model.*;
import com.none.orgaappbackend.organization.application.service.OrganizationService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.jmolecules.architecture.hexagonal.PrimaryAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/organization")
@Transactional
@Slf4j
@PrimaryAdapter
public class UnauthorizedOrganizationController {

    @Autowired
    private OrganizationService organizationService;

    @GetMapping("/confirmation")
    public ResponseEntity<String> confirmOrganization(@RequestParam ("confirmationToken") String confirmationToken){
        organizationService.activateOrganization(confirmationToken);
        return ResponseEntity.ok("<p>Die E-Mail-Adresse wurde erfolgreich bestätigt.</p>");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseTO> forgotPassword(@RequestBody ForgotPasswordRequestTO forgotPasswordTo){
        organizationService.resetPassword(forgotPasswordTo.getEmail());
        return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseTO("Wenn deine E-Mail-Adresse dem System bekannt ist, erhältst du in Kürze eine Mail mit einem temporären Passwort. Bitte ändere es, nachdem du dich das erste Mal damit eingeloggt hast. Vergiss nicht, ggf. auch im Spam-Ordner nachzuschauen."));
    }

    @PostMapping("/signup")
    public ResponseEntity<ResponseTO> registerOrganization(@Valid @RequestBody OrganizationSignupRequest signUpRequest) {
        organizationService.register(
                signUpRequest.getUsername(),
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                signUpRequest.getPassword());
        return ResponseEntity.ok(new MessageResponseTO("Du hast dich erfolgreich als Teilnehmender registriert. Bitte bestätige nun noch deine E-Mail-Adresse."));
    }
}
