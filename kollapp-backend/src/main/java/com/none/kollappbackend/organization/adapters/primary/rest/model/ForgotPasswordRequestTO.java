package com.none.kollappbackend.organization.adapters.primary.rest.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ForgotPasswordRequestTO {
    @NotNull(message = "validation.email.required")
    @Email(message = "validation.email.invalid")
    private String email;
}
