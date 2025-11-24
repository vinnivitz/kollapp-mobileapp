package org.kollapp.organization.application.exception;

import org.springframework.context.MessageSource;

import org.kollapp.core.application.exceptions.AbstractLocalizedException;

public class ActivityNotFoundException extends AbstractLocalizedException {
    public ActivityNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.activity.not-found");
    }
}
