package com.none.kollappbackend.organization.adapters.primary.rest.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ResetPasswordRequestTO {
    @NotNull(message = "validation.password.required")
    @Pattern(regexp = ".{8,}", message = "{validation.password.minlength}")
    @Size(max = 255, message = "{validation.password.maxlength}")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "{validation.password.pattern}")
    private String password;
}
