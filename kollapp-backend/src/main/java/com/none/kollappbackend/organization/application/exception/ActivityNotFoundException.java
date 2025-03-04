package com.none.kollappbackend.organization.application.exception;

import com.none.kollappbackend.core.application.exceptions.AbstractLocalizedException;
import org.springframework.context.MessageSource;

public class ActivityNotFoundException extends AbstractLocalizedException {
    public ActivityNotFoundException(MessageSource messageSource) {
        super(messageSource, "error.activity.not-found");
    }
}
