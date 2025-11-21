package org.kollappbackend.organization.application.exception;

import org.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class ActivityNotFoundException extends AbstractLocalizedException {
    public ActivityNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.activity.not-found");
    }
}
