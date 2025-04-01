package com.none.kollappbackend.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AbstractLocaleResolver;

import java.util.Locale;
import java.util.Optional;

@Component
public class LocaleConfig {

    /**
     * It provides the message source for the internationalization.
     *
     * @return the message source
     */
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:i18n/messages");
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }

    /**
     * It provides the locale resolver for the internationalization.
     *
     * @return the locale resolver
     */
    @Bean
    public LocaleResolver localeResolver() {
        return new HeaderLocaleResolver();
    }

    /**
     * Custom implementation of LocaleResolver that retrieves locale from the
     * 'Accept-Language' header.
     */
    public static class HeaderLocaleResolver extends AbstractLocaleResolver {
        @Override
        public Locale resolveLocale(HttpServletRequest request) {
            String acceptLanguage = request.getHeader("Accept-Language");
            return Optional.ofNullable(acceptLanguage).map(Locale::forLanguageTag).orElse(getDefaultLocale());
        }

        @Override
        public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
            throw new UnsupportedOperationException("Cannot change HTTP header 'Accept-Language'");
        }
    }
}
