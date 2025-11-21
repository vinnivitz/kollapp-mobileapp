package org.kollappbackend.core.adapters.primary.rest.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;

@Setter
@Getter
public class MessageResponseTO extends ResponseTO {
    private String message;

    public MessageResponseTO(String message, MessageSource messageSource) {
        this.message = messageSource.getMessage(message, null, LocaleContextHolder.getLocale());
    }
}
