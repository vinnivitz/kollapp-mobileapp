package org.kollappbackend.core.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum TemplateView {
    ACCOUNT_CONFIRMED("account-confirmed");

    private String viewName;
}
