package com.none.orgaappbackend.organization.adapters.primary.rest.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoginRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;
}
