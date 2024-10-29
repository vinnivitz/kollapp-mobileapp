package com.none.orgaappbackend.user.adapters.primary.rest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.transaction.Transactional;
import org.enviro.co2fzsbackend.user.application.service.impl.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
@Transactional
public class UserController {

    @Autowired
    private UserServiceImpl userServiceImpl;

    @DeleteMapping("/participant/{participant-id}")
    @PreAuthorize("hasRole('CONTACT_TEACHER') or hasRole ('ADMIN')")
    @Operation(summary = "Teilnehmer löschen", security = { @SecurityRequirement(name = "bearer-key") })
    public void deleteParticipant(@PathVariable("participant-id") long participantId){
        this.userServiceImpl.deleteParticipant(participantId);
    }
}
