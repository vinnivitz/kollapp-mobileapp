package org.kollapp.user.application.service.impl;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import org.kollapp.user.application.exception.UsernameNotFoundException;
import org.kollapp.user.application.model.KollappUser;
import org.kollapp.user.application.model.KollappUserDetails;
import org.kollapp.user.application.repository.KollappUserRepository;

@Service
@Slf4j
public class KollappUserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private KollappUserRepository userRepository;

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        KollappUser kollappUser = userRepository.findByUsername(username).orElseThrow(UsernameNotFoundException::new);
        List<GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority(kollappUser.getRole().name()));
        return KollappUserDetails.builder()
                .username(kollappUser.getUsername())
                .isActivated(kollappUser.isActivated())
                .email(kollappUser.getEmail())
                .password(kollappUser.getPassword())
                .authorities(authorities)
                .build();
    }
}
