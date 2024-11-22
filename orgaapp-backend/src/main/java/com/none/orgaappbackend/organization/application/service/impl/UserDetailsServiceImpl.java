package com.none.orgaappbackend.organization.application.service.impl;

import com.none.orgaappbackend.organization.application.model.OrganizationDetails;
import com.none.orgaappbackend.organization.application.repository.OrganizationRepository;
import com.none.orgaappbackend.organization.application.model.Organization;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private OrganizationRepository orgaRepository;
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Organization organization = orgaRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("Username " + username + " not found."));
        return OrganizationDetails.builder().username(organization.getUsername()).isActivated(organization.isActivated()).email(organization.getEmail()).name(organization.getName()).password(organization.getPassword()).build();
    }
}
