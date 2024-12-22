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
    @NotNull(message = "validation.old-password.required")
    private String oldPassword;

    @NotNull(message = "validation.new-password.required")
    @Pattern(regexp = ".{8,}", message = "{validation.new-password.minlength}")
    @Size(max = 255, message = "{validation.new-password.maxlength}")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "{validation.new-password.pattern}")
    private String newPassword;
}
