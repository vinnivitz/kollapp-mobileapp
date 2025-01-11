package com.none.kollappbackend.user.application.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class KollappUserDetails implements org.springframework.security.core.userdetails.UserDetails {
    private Long id;
    private String username;
    private String email;
    private boolean isActivated;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
}
