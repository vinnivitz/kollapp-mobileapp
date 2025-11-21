package org.kollapp.user.application.model;

import java.util.Collection;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class KollappUserDetails implements UserDetails {
    private long id;
    private String username;
    private String email;
    private boolean isActivated;
    @JsonIgnore private String password;
    private Collection<? extends GrantedAuthority> authorities;
}
