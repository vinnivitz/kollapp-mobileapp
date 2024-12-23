package com.none.kollappbackend.organization.application.service.impl;

import com.none.kollappbackend.organization.application.model.OrganizationDetails;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.exception.UsernameNotFoundException;
import com.none.kollappbackend.organization.application.model.Organization;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private MessageSource messageSource;

    @Autowired
    private OrganizationRepository orgaRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Organization organization = orgaRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(messageSource));
        return OrganizationDetails.builder().username(organization.getUsername()).isActivated(organization.isActivated()).email(organization.getEmail()).password(organization.getPassword()).build();
    }
}
