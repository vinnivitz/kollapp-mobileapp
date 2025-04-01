package org.kollappbackend.user.application.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.kollappbackend.user.application.exception.UsernameNotFoundException;
import org.kollappbackend.user.application.model.KollappUser;
import org.kollappbackend.user.application.model.KollappUserDetails;
import org.kollappbackend.user.application.repository.KollappUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class KollappUserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private KollappUserRepository userRepository;

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        KollappUser kollappUser =
                userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(messageSource));
        List<GrantedAuthority> authorities =
                kollappUser.getRoles().stream().map(role -> new SimpleGrantedAuthority(role.name()))
                        .collect(Collectors.toList());
        return KollappUserDetails.builder().username(kollappUser.getUsername()).isActivated(kollappUser.isActivated())
                .email(kollappUser.getEmail()).password(kollappUser.getPassword()).authorities(authorities).build();
    }
}