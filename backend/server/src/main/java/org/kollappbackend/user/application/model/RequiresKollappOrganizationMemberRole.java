package org.kollappbackend.user.application.model;

import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.security.access.prepost.PreAuthorize;

@Inherited
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize(
        "hasRole(T(org.kollappbackend.user.application.model.SystemRole)"
                + ".ROLE_KOLLAPP_ORGANIZATION_MEMBER.name())")
public @interface RequiresKollappOrganizationMemberRole {}
