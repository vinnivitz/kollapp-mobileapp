package com.none.orgaappbackend.organization.application.service;

import com.none.orgaappbackend.organization.application.OrganizationRepository;
import com.none.orgaappbackend.organization.application.model.Organization;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private OrganizationRepository userRepository;
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Organization organization = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Username " + username + " not found."));
        return UserDetailsImpl.builder().username(organization.getUsername()).isActivated(organization.isActivated()).email(organization.getEmail()).name(organization.getName()).password(organization.getPassword()).build();
    }
}
