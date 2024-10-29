package com.none.orgaappbackend.user.adapters.primary.rest;

import com.none.orgaappbackend.user.adapters.primary.rest.model.LoginRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.enviro.co2fzsbackend.core.util.JwtUtil;
import org.enviro.co2fzsbackend.user.adapters.primary.rest.model.*;
import org.enviro.co2fzsbackend.user.adapters.secondary.db.jpa.ContactTeacherJpaRepository;
import org.enviro.co2fzsbackend.user.adapters.secondary.db.jpa.ParticipantJpaRepository;
import org.enviro.co2fzsbackend.user.adapters.secondary.db.jpa.RoleJpaRepository;
import org.enviro.co2fzsbackend.user.adapters.secondary.db.jpa.UserJpaRepository;
import org.enviro.co2fzsbackend.user.application.model.*;
import org.enviro.co2fzsbackend.user.application.service.impl.EmailService;
import org.enviro.co2fzsbackend.user.application.service.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@Transactional
@Slf4j
public class AuthController {
    private final String URL = "https://xxx.de/";
    @Autowired
    AuthenticationManager authenticationManager;

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
    private UserServiceImpl userServiceImpl;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        Date expirationDate = jwtUtil.generateExpirationDate();
        String jwt = jwtUtil.generateJwtToken(authentication, expirationDate);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList().get(0);

        if(!userDetails.isActivated()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new MessageTO("Bitte bestätige zunächst deine E-Mail-Adresse!"));
        }
        return ResponseEntity.ok(new LoginResponse(jwt,
                userDetails.getUsername(),
                userDetails.getEmail(),
                role,
                userDetails.getName(),
                userDetails.getSurname(),
                expirationDate.getTime()));
    }

    @GetMapping("/confirmation")
    public ResponseEntity<String> confirmUser(@RequestParam ("confirmationToken") String confirmationToken){
        if(!jwtUtil.validateJwtToken(confirmationToken)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("<p>Der Link ist nicht (mehr) gültig!</p>");
        }
        Long userId = Long.parseLong(jwtUtil.getSubjectFromJwtToken(confirmationToken));
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("Der Nutzer existiert nicht!"));
        if(user.isActivated()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("<p>Die E-Mail-Adresse wurde bereits bestätigt!</p>");
        }
        user.setActivated(true);
        return ResponseEntity.ok("<p>Die E-Mail-Adresse wurde erfolgreich bestätigt.</p>");
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasRole('CONTACT_TEACHER') or hasRole('ADMIN') or hasRole('PARTICIPANT')")
    @Operation(summary = "Das Passwort ändern", security = { @SecurityRequirement(name = "bearer-key") })
    public ResponseEntity<MessageTO> changePassword(@RequestBody PasswordChangeRequestTO changeRequestTo){
        String usernameOfLoggedInUser = this.userServiceImpl.getUsernameOfLoggedInUser();
        User user = userServiceImpl.getUserByUsername(usernameOfLoggedInUser);
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
        Optional<User> userOpt = userServiceImpl.getUserOptionalByEmailAndUsername(email, username);
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
