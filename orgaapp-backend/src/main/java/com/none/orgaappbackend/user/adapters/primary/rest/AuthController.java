package com.none.orgaappbackend.user.adapters.primary.rest;

import com.none.orgaappbackend.core.util.JwtUtil;
import com.none.orgaappbackend.user.adapters.primary.rest.model.*;
import com.none.orgaappbackend.user.application.AuthService;
import com.none.orgaappbackend.user.application.RoleRepository;
import com.none.orgaappbackend.user.application.UserRepository;
import com.none.orgaappbackend.user.adapters.primary.rest.model.LoginResponse;
import com.none.orgaappbackend.user.application.UserService;
import com.none.orgaappbackend.user.application.model.User;
import com.none.orgaappbackend.user.application.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Transactional
@Slf4j
public class AuthController {
    private final String URL = "https://xxx.de/";

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/confirmation")
    public ResponseEntity<String> confirmUser(@RequestParam ("confirmationToken") String confirmationToken){
        userService.activateUser(confirmationToken);
        return ResponseEntity.ok("<p>Die E-Mail-Adresse wurde erfolgreich bestätigt.</p>");
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Das Passwort ändern", security = { @SecurityRequirement(name = "bearer-key") })
    public ResponseEntity<MessageTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo){
        String usernameOfLoggedInUser = userService.getLoggedInUser().getUsername();
        User user = userService.getUserByUsername(usernameOfLoggedInUser);
        boolean oldPasswordIsCorrect = encoder.matches(changeRequestTo.getOldPassword(), user.getPassword());
        if(!oldPasswordIsCorrect){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageTO("Das alte Passwort ist nicht korrekt!"));
        }
        user.setPassword(encoder.encode(changeRequestTo.getNewPassword()));
        return ResponseEntity.status(HttpStatus.OK).body(new MessageTO("Das Passwort wurde erfolgreich geändert."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageTO> forgotPassword(@RequestBody ForgotPasswordRequestTO forgotPasswordTo){
        String email = forgotPasswordTo.getEmail();
        String username = forgotPasswordTo.getUsername();
        Optional<User> userOpt = userService.getUserOptionalByEmailAndUsername(email, username);
        if(userOpt.isPresent()){
            User user = userOpt.get();
            String tempPassword = RandomStringUtils.randomAlphanumeric(8);
            String tempPasswordEncoding = encoder.encode(tempPassword);
            log.info("Neues temporäres Passwort generiert für Nutzer " + user.getUsername() + ":" + tempPassword);
            emailService.sendForgotPasswordMail(user.getEmail(), tempPassword);
            user.setPassword(tempPasswordEncoding);
        }
        return ResponseEntity.status(HttpStatus.OK).body(new MessageTO("Wenn deine E-Mail-Adresse dem System bekannt ist, erhältst du in Kürze eine Mail mit einem temporären Passwort. Bitte ändere es, nachdem du dich das erste Mal damit eingeloggt hast. Vergiss nicht, ggf. auch im Spam-Ordner nachzuschauen."));
    }
}
