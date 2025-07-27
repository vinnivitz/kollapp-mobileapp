package org.kollappbackend.user.application.model;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Inherited
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole(T(org.kollappbackend.user.application.model" + ".SystemRole).ROLE_ORGANIZATION_MANAGER.name())")
public @interface RequiresManagerRole {
}
