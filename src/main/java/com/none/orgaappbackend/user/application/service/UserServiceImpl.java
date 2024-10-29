package com.none.orgaappbackend.user.application.service;

import com.none.orgaappbackend.core.exception.EmailIsAlreadyConfirmedException;
import com.none.orgaappbackend.core.exception.InvalidConfirmationLinkException;
import com.none.orgaappbackend.core.exception.UsernameIsAlreadyInUseException;
import com.none.orgaappbackend.user.application.RoleRepository;
import com.none.orgaappbackend.user.application.UserRepository;
import com.none.orgaappbackend.user.application.UserService;
import com.none.orgaappbackend.user.application.model.ERole;
import com.none.orgaappbackend.user.application.model.Role;
import com.none.orgaappbackend.user.application.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.none.orgaappbackend.core.util.JwtUtil;

import java.util.Optional;

@Slf4j
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    @Autowired
    PasswordEncoder encoder;

    public User getUserByUsername(String username){
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Der Nutzername wurde nicht gefunden!"));
    }

    public User getLoggedInUser(){
        String username = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        return userRepo.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Der Nutzername existiert nicht!"));
    }

    public Optional<User> getUserOptionalByEmailAndUsername(String email, String username){
        return this.userRepo.findByEmailAndUsername(email, username);
    }

    @Override
    public void activateUser(String confirmationToken) {
        if(!jwtUtil.validateJwtToken(confirmationToken)){
            throw new InvalidConfirmationLinkException();
        }
        long userId = Long.parseLong(jwtUtil.getSubjectFromJwtToken(confirmationToken));
        User user = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("Der Nutzer existiert nicht!"));
        if(user.isActivated()){
            throw new EmailIsAlreadyConfirmedException();
        }
        user.setActivated(true);
    }

    public boolean isUsernameFree(String username){
        if (userRepo.existsByUsername(username)) {
            throw new UsernameIsAlreadyInUseException();
        }
        return true;
    }

    public long addUserWithAdminRole(String username, String name, String surname, String email, String password) {
        ERole roleName = ERole.ROLE_ADMIN;
        Role role = roleRepo.findByName(roleName).orElseThrow(() -> new RuntimeException("Role not found!"));
        String encodedPassword = encoder.encode(password);
        User user = User.builder().isActivated(false).username(username).name(name).surname(surname).email(email).password(encodedPassword).role(role).build();
        User addedUser = userRepo.save(user);
        String confirmationToken = jwtUtil.generateJwtTokenForConfirmation(addedUser);
        String confirmationUrl = "https://xxx.com/" + "api/auth/confirmation?confirmationToken=" + confirmationToken;
        emailService.sendConfirmationMail(user.getEmail(), confirmationUrl);
        log.info("Created confirmation url: " + confirmationUrl);
        return addedUser.getId();
    }
}
