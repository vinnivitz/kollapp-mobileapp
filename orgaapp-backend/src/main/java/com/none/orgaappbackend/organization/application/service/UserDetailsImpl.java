package com.none.orgaappbackend.organization.application.service;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String username;
    private String email;
    private String name;
    private boolean isActivated;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
}
