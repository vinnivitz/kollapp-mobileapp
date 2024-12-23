package com.none.kollappbackend.organization.application.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class OrganizationDetails implements UserDetails {
    private Long id;
    private String username;
    private String email;
    private boolean isActivated;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
}
