package com.none.kollappbackend.organization.adapters.primary.rest.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordChangeRequestTO {
    private String oldPassword;
    private String newPassword;
}
