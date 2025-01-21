package com.none.kollappbackend.organization.application.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

import com.none.kollappbackend.organization.application.exception.OrganizationNotFoundException;
import com.none.kollappbackend.organization.application.model.Organization;
import com.none.kollappbackend.organization.application.repository.OrganizationRepository;
import com.none.kollappbackend.organization.application.service.OrganizationService;
import com.none.kollappbackend.user.application.service.KollappUserService;

import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;

@Transactional
@Slf4j
@Service
public class OrganizationServiceImpl implements OrganizationService {
    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private MessageSource messageSource;

    @Autowired
    private KollappUserService kollappUserService;

    @Override
    public Organization getOrganizationById(long id) {
        return organizationRepository.findById(id).orElseThrow(() -> new OrganizationNotFoundException(messageSource));
    }

    @Override
    public long createOrganization(String name) {
        Organization organization = Organization.builder().name(name).build();
        organizationRepository.save(organization);
        return organization.getId();
    }

    @Override
    public Organization updateOrganization(String name) {
        Organization organization = getOrganizationByLoggedInUser();
        if (name != null && !organization.getName().equals(name)) {
            organization.setName(name);
        }
        return organization;
    }

    @Override
    public void deleteOrganization(long id) {
        organizationRepository.deleteById(id);
    }

    @Override
    public Organization getOrganizationByLoggedInUser() {
        long organizationId = kollappUserService.getLoggedInKollappUser().getOrganizationId();
        return getOrganizationById(organizationId);
    }
}
