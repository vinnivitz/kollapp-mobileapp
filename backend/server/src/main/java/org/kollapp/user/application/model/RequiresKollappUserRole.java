package org.kollapp.user.application.model;

import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import org.springframework.security.access.prepost.PreAuthorize;

@Inherited
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize(
        "hasRole(T(org.kollapp.user.application.model.SystemRole).ROLE_KOLLAPP_USER.name()) or "
                + "hasRole(T(org.kollapp.user.application.model.SystemRole).ROLE_KOLLAPP_ORGANIZATION_MEMBER.name"
                + "())")
public @interface RequiresKollappUserRole {}
