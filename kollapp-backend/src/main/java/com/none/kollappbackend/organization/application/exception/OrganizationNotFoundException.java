package com.none.kollappbackend.organization.application.exception;

import org.springframework.context.MessageSource;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;

public class OrganizationNotFoundException extends AbstractLocalizedException {
    public OrganizationNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.organization.not-found");
    }
}
